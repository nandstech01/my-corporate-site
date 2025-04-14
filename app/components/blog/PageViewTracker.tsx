import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

interface PageViewTrackerProps {
  slug: string
}

export function PageViewTracker({ slug }: PageViewTrackerProps) {
  useEffect(() => {
    const trackPageView = async () => {
      const supabase = createClient()
      
      // Get current view count
      const { data: existingView } = await supabase
        .from('page_views')
        .select('views')
        .eq('slug', slug)
        .single()

      if (existingView) {
        // Increment view count
        await supabase
          .from('page_views')
          .update({ views: existingView.views + 1 })
          .eq('slug', slug)
      } else {
        // Create new record
        await supabase
          .from('page_views')
          .insert([{ slug, views: 1 }])
      }
    }

    trackPageView()
  }, [slug])

  return null
} 