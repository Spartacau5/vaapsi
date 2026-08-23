'use client'

import { useState } from 'react'
import { Row } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import { passportCopy } from '@/content/passport'
import { cn } from '@/lib/utils'

/**
 * The passport as a two-sided document that turns over.
 *
 * **Not a tab bar.** The EuFSI source uses five tabs and it reads as compliance
 * software — tabs say "here are five equivalent panels of data", which is exactly
 * the wrong frame. A document with a front and a back says "this is a record",
 * and it makes the structural claim the product needs: the story is the front,
 * and the paperwork behind it is checkable.
 *
 * Two sides, not five. Any more and it is a tab bar with a nicer control.
 *
 * Implementation notes:
 *
 * - Both sides are always in the DOM. The hidden one gets `hidden`, so it is out
 *   of the tab order and out of the accessibility tree, but it is server-rendered
 *   and therefore indexable and printable.
 * - **In print, both sides render, stacked, with the control hidden.** The QR
 *   resolves here, so a printed passport that only shows one half would be a
 *   broken artefact.
 * - The control is a real radio group rather than buttons, because this is a
 *   choice between two states rather than two actions — which also gives arrow-key
 *   navigation for free.
 *
 * Motion: the sides cross-fade rather than performing a 3D card flip. A rotating
 * card is the obvious literal reading of "two-sided", and it is wrong here — it
 * puts a novelty gesture on the most serious content on the site, and mid-flip
 * the text is unreadable. The flip is a metaphor for the structure, not an
 * animation brief.
 */
export function PassportDocument({
  front,
  back,
}: {
  front: React.ReactNode
  back: React.ReactNode
}) {
  const [side, setSide] = useState<'front' | 'back'>('front')

  return (
    <div>
      <Row
        gap={0}
        justify="between"
        align="center"
        className="mb-8 border-b border-line pb-3 print:hidden"
      >
        <fieldset>
          <legend className="sr-only">Which side of the passport to show</legend>
          <Row gap={6}>
            <SideToggle
              label={passportCopy.sections.front}
              active={side === 'front'}
              onSelect={() => setSide('front')}
            />
            <SideToggle
              label={passportCopy.sections.back}
              active={side === 'back'}
              onSelect={() => setSide('back')}
            />
          </Row>
        </fieldset>

        <Type as="span" size="xs" tone="subtle" className="hidden tablet:block">
          {side === 'front' ? '1 / 2' : '2 / 2'}
        </Type>
      </Row>

      {/*
        `hidden` rather than unmounting: the inactive side stays server-rendered
        for search engines and for print, and switching sides does not re-run the
        seal animation or lose scroll position.
      */}
      <div className={cn(side === 'front' ? 'block' : 'hidden', 'print:block')}>{front}</div>
      <div
        className={cn(
          side === 'back' ? 'block' : 'hidden',
          'print:mt-16 print:block print:break-before-page',
        )}
      >
        {back}
      </div>
    </div>
  )
}

function SideToggle({
  label,
  active,
  onSelect,
}: {
  label: string
  active: boolean
  onSelect: () => void
}) {
  return (
    <label className="group/side flex cursor-pointer items-center gap-2">
      <input
        type="radio"
        name="passport-side"
        checked={active}
        onChange={onSelect}
        className="peer sr-only"
      />
      {/* The dot again. Active state, same mark. */}
      <span
        aria-hidden
        className={cn(
          'ease size-1.5 rounded-full transition-colors duration-fast',
          active ? 'bg-accent' : 'bg-line-strong group-hover/side:bg-ink-subtle',
        )}
      />
      <Type
        as="span"
        family="display"
        size="lg"
        weight="heading"
        tone={active ? 'default' : 'subtle'}
        className="peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-accent"
      >
        {label}
      </Type>
    </label>
  )
}
