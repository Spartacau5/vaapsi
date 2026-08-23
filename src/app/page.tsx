import { common } from '@/content'

export default function HomePage() {
  return (
    <main className="p-8">
      <h1>{common.brand.name}</h1>
      <p>{common.brand.tagline}</p>
      <p>Scaffold only. Design tokens land in Phase 1.</p>
    </main>
  )
}
