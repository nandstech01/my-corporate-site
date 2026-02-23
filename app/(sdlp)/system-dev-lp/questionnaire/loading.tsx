export default function QuestionnaireLoading() {
  return (
    <div className="min-h-screen bg-sdlp-bg flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-2 bg-sdlp-border rounded-full w-full" />
          <div className="flex justify-between">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="h-5 w-5 rounded-full bg-sdlp-border" />
            ))}
          </div>
        </div>
        <div className="animate-pulse rounded-2xl bg-white p-8 shadow-lg border border-sdlp-border space-y-4">
          <div className="h-6 bg-sdlp-border rounded w-3/4" />
          <div className="h-4 bg-sdlp-border rounded w-1/2" />
          <div className="space-y-3 mt-6">
            <div className="h-12 bg-sdlp-border rounded-xl" />
            <div className="h-12 bg-sdlp-border rounded-xl" />
            <div className="h-12 bg-sdlp-border rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
