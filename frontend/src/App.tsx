import { useEffect, useState } from 'react'

type Health = { status: string; database: string }

export default function App() {
  const [health, setHealth] = useState<Health | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then(setHealth)
      .catch(() => setError(true))
  }, [])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-900 text-slate-100">
      <h1 className="text-4xl font-bold">Code Connect</h1>
      <p className="text-slate-400">
        {error
          ? 'API indisponível'
          : health
            ? `API: ${health.status} · Banco: ${health.database}`
            : 'Verificando API...'}
      </p>
    </main>
  )
}
