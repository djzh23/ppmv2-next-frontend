export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-destructive">403</h1>
        <h2 className="text-2xl font-semibold mt-4">Access Forbidden</h2>
        <p className="text-muted-foreground mt-2">You don't have permission to access this page.</p>
      </div>
    </div>
  )
}
