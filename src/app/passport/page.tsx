import type { Metadata } from 'next'
import { PageScaffold } from '@/components/patterns/page-scaffold'
import { PASSPORT_NAME, passportCopy } from '@/content/passport'

export const metadata: Metadata = { title: PASSPORT_NAME.title }

/**
 * The explainer. Note that nothing here types the word "passport" — the name is
 * undecided, so it comes from `content/passport.ts` and renaming it is one edit.
 */
export default function PassportExplainerPage() {
  return (
    <PageScaffold
      eyebrow={passportCopy.explainer.eyebrow}
      title={passportCopy.explainer.title}
      phase="Phase 5"
      note={passportCopy.explainer.standfirst}
    />
  )
}
