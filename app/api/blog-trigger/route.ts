import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { GoogleAuth } from 'google-auth-library'

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

async function getGcpAccessToken(): Promise<string> {
  const saKeyJson = process.env.GCP_SA_KEY
  if (!saKeyJson) {
    throw new Error('GCP_SA_KEY not configured')
  }

  const credentials = JSON.parse(saKeyJson)
  const auth = new GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  })

  const client = await auth.getClient()
  const tokenResponse = await client.getAccessToken()
  if (!tokenResponse.token) {
    throw new Error('Failed to obtain GCP access token')
  }
  return tokenResponse.token
}

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

    // Trigger GCP Cloud Run Job
    const gcpProjectId = process.env.GCP_PROJECT_ID
    const gcpRegion = process.env.GCP_REGION || 'asia-northeast1'

    try {
      if (!gcpProjectId) {
        return NextResponse.json(
          { error: 'GCP_PROJECT_ID not configured' },
          { status: 500 }
        )
      }

      const accessToken = await getGcpAccessToken()

      // Cloud Run Jobs API
      const cloudRunUrl = `https://run.googleapis.com/v2/projects/${gcpProjectId}/locations/${gcpRegion}/jobs/blog-pipeline:run`

      const response = await fetch(cloudRunUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
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
