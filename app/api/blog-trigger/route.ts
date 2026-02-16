import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error('Missing required Supabase environment variables')
}

const supabaseServiceRole = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

export const maxDuration = 30
export const dynamic = 'force-dynamic'

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(request: NextRequest) {
  try {
    // Verify internal API secret (fail-closed)
    const authHeader = request.headers.get('authorization')
    const expectedSecret = process.env.BLOG_WORKER_API_SECRET
    if (!expectedSecret) {
      return NextResponse.json(
        { error: 'Server misconfigured' },
        { status: 500 }
      )
    }
    if (authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const jobId = typeof body?.jobId === 'string' ? body.jobId : ''

    if (!jobId || !UUID_REGEX.test(jobId)) {
      return NextResponse.json(
        { error: 'Invalid or missing jobId (must be UUID)' },
        { status: 400 }
      )
    }

    // Verify job exists and is queued
    const { data: job, error: fetchError } = await supabaseServiceRole
      .from('blog_jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (fetchError || !job) {
      return NextResponse.json(
        { error: `Job not found: ${jobId}` },
        { status: 404 }
      )
    }

    if (job.status !== 'queued') {
      return NextResponse.json(
        { error: `Job is not queued (status: ${job.status})` },
        { status: 400 }
      )
    }

    // Trigger GCP Cloud Run Job (update status only after successful trigger)
    const gcpProjectId = process.env.GCP_PROJECT_ID
    const gcpRegion = process.env.GCP_REGION || 'asia-northeast1'
    const gcpAccessToken = process.env.GCP_ACCESS_TOKEN

    try {
      if (!gcpProjectId || !gcpAccessToken) {
        // Fallback: trigger via GitHub Actions
        const githubToken = process.env.GITHUB_TOKEN
        if (githubToken) {
          const response = await fetch(
            `https://api.github.com/repos/${process.env.GITHUB_REPO ?? 'nands/my-corporate-site'}/actions/workflows/blog-worker-run.yml/dispatches`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${githubToken}`,
                Accept: 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ref: 'main',
                inputs: { job_id: jobId },
              }),
            }
          )

          if (!response.ok) {
            throw new Error(
              `GitHub Actions trigger failed: ${response.status}`
            )
          }

          // Mark as running only after successful trigger
          await supabaseServiceRole
            .from('blog_jobs')
            .update({ status: 'running', started_at: new Date().toISOString() })
            .eq('id', jobId)

          return NextResponse.json({
            success: true,
            trigger: 'github-actions',
            jobId,
          })
        }

        return NextResponse.json(
          { error: 'No GCP or GitHub Actions credentials configured' },
          { status: 500 }
        )
      }

      // Cloud Run Jobs API
      const cloudRunUrl = `https://run.googleapis.com/v2/projects/${gcpProjectId}/locations/${gcpRegion}/jobs/blog-pipeline:run`

      const response = await fetch(cloudRunUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${gcpAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          overrides: {
            containerOverrides: [
              {
                args: ['run-pipeline', '--job-id', jobId],
              },
            ],
          },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `Cloud Run Job trigger failed: ${response.status} ${errorText}`
        )
      }

      const result = await response.json()
      const gcpJobId =
        result.metadata?.name || result.name || 'unknown'

      // Mark as running + save GCP job ID only after successful trigger
      await supabaseServiceRole
        .from('blog_jobs')
        .update({
          status: 'running',
          started_at: new Date().toISOString(),
          gcp_job_id: gcpJobId,
        })
        .eq('id', jobId)

      return NextResponse.json({
        success: true,
        trigger: 'cloud-run',
        jobId,
        gcpJobId,
      })
    } catch (triggerError) {
      // Rollback: mark job as failed if trigger fails
      await supabaseServiceRole
        .from('blog_jobs')
        .update({
          status: 'failed',
          error_message: `Trigger failed: ${(triggerError as Error).message}`,
        })
        .eq('id', jobId)
      throw triggerError
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to trigger blog pipeline',
        details: (error as Error).message,
      },
      { status: 500 }
    )
  }
}