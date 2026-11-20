import type { Metadata } from 'next'
import { TesterHero } from '@/components/patterns/tester/tester-hero'

export const metadata: Metadata = {
  title: 'Tester',
  robots: { index: false, follow: false },
}

export default function TesterPage() {
  return <TesterHero />
}
