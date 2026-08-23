import { ProvenanceDot } from './provenance-dot'
import { Stack } from '@/components/primitives/layout'
import { Type } from '@/components/primitives/type'
import { formatDate } from '@/lib/format/date'
import type { ChainEvent, ChainEventType } from '@/lib/types'

/**
 * The journey line.
 *
 * **This is the emotional centre of the product and it gets the most space.**
 * It is also the thing the EuFSI passport does not have: EuFSI answers "what is
 * this made of and who made it", which is a compliance question. This answers
 * "where has this been", which is the question a resale buyer is actually asking.
 *
 * Typographic, not iconographic. No icons per event type, no coloured stages, no
 * progress bar — a garment's life is not a checkout funnel and it does not have
 * a completion percentage. Just a rule, the dates, and the words.
 *
 * Horizontal on desktop, where the sequence reads as a line and the eye can
 * compare gaps between events. Vertical on mobile, where a horizontally
 * scrolling timeline means a shopper can only ever see two events at once and
 * loses the shape entirely.
 */

/**
 * Shopper-facing labels for the event types. Deliberately the same verbs used on
 * the home page explainer, so someone who read that arrives here recognising
 * them.
 */
const EVENT_LABEL: Record<ChainEventType, string> = {
  made: 'Made',
  first_sold: 'First sold',
  owned: 'Owned',
  returned: 'Came back',
  inspected: 'Inspected',
  repaired: 'Repaired',
  relisted: 'Relisted',
}

export function JourneyLine({ chain }: { chain: readonly ChainEvent[] }) {
  if (chain.length === 0) return null

  return (
    <>
      {/* Mobile and tablet: vertical. */}
      <ol className="desktop:hidden">
        {chain.map((event) => (
          <li key={event.id} className="grid grid-cols-[auto_1fr] gap-x-4 border-line">
            <div className="relative flex w-3 justify-center">
              {/* The rule runs through the marks, so the sequence is a line
                  rather than a stack of rows. */}
              <span className="absolute inset-y-0 w-px bg-line" aria-hidden />
              <span className="relative bg-background py-1.5">
                <ProvenanceDot provenance={event.verification.provenance} />
              </span>
            </div>
            <div className="pb-8">
              <EventBody event={event} />
            </div>
          </li>
        ))}
      </ol>

      {/* Desktop: horizontal. */}
      <ol
        className="hidden desktop:grid"
        style={{ gridTemplateColumns: `repeat(${chain.length}, minmax(0, 1fr))` }}
      >
        {chain.map((event) => (
          <li key={event.id} className="relative pr-4">
            <span className="absolute left-0 right-0 top-1.5 h-px bg-line" aria-hidden />
            <span className="relative -ml-px inline-block bg-background pr-1.5">
              <ProvenanceDot provenance={event.verification.provenance} />
            </span>
            <div className="pt-4">
              <EventBody event={event} />
            </div>
          </li>
        ))}
      </ol>
    </>
  )
}

function EventBody({ event }: { event: ChainEvent }) {
  return (
    <Stack gap={1}>
      <Type as="p" family="display" size="lg" weight="heading">
        {EVENT_LABEL[event.type]}
      </Type>
      <Type as="time" size="xs" tone="subtle" numeric dateTime={event.date}>
        {formatDate(event.date)}
      </Type>
      <Type as="p" size="sm" tone="muted">
        {event.actor}
      </Type>
      {event.note !== null && (
        <Type as="p" size="xs" tone="subtle" measure="narrow" className="pt-1">
          {event.note}
        </Type>
      )}
      {/* How we know. Named, always — an event nobody can vouch for should say
          who told us, not stay silent. */}
      <Type as="p" size="xs" tone="subtle" className="pt-1 italic">
        {event.verification.value}
      </Type>
    </Stack>
  )
}
