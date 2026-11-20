'use client'

import { useState } from 'react'
import Link from 'next/link'
import { footerMeta, footerNav } from '@/content/navigation'
import brand from './brand.module.css'

/**
 * A conventional e-commerce footer in the new identity: newsletter, the site's
 * existing link columns, payment and region, closing on a plain legal bar.
 *
 * The link groups and meta come straight from content/navigation, so this
 * footer can never point somewhere the real one doesn't.
 *
 * The newsletter form is NOT connected to anything yet. It validates the
 * address and shows a confirmation, but nothing is stored or sent. Wire
 * `subscribe` to the real list before this ships.
 */

const COPY = {
  newsletterTitle: 'Get first look',
  newsletterBody:
    'New drops, restocks and stories from the studio. One email a fortnight, at most.',
  emailLabel: 'Email address',
  emailPlaceholder: 'you@example.com',
  submit: 'Sign up',
  thanks: 'You are on the list. First email lands with the next drop.',
  invalid: 'That does not look like an email address.',
  region: `${footerMeta.country} · ${footerMeta.currency}`,
} as const

export function BrandFooter() {
  const year = new Date().getUTCFullYear()
  const columns = footerNav.filter((group) => group.heading !== 'Legal')
  const legal = footerNav.find((group) => group.heading === 'Legal')?.items ?? []

  return (
    <footer
      className={brand.jost}
      style={{ background: 'var(--vaapsi-natural)', color: 'var(--vaapsi-forest)' }}
    >
      <div className="mx-auto max-w-[1360px] px-5 tablet:px-8">
        {/* ---- Newsletter + columns ---- */}
        <div className="grid gap-12 py-16 desktop:grid-cols-12 desktop:gap-8 desktop:py-20">
          <div className="desktop:col-span-4">
            <h2 className={`${brand.title} text-2xl`}>{COPY.newsletterTitle}</h2>
            <p className="mt-3 max-w-[36ch] text-sm opacity-75">{COPY.newsletterBody}</p>
            <Newsletter />
          </div>

          <nav aria-label="Footer" className="desktop:col-span-7 desktop:col-start-6">
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 tablet:grid-cols-4">
              {columns.map((group) => (
                <div key={group.heading}>
                  <h2 className={brand.label} style={{ color: 'var(--vaapsi-olive)' }}>
                    {group.heading}
                  </h2>
                  <ul className="mt-4 space-y-2.5">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="text-sm opacity-80 transition-opacity hover:underline hover:opacity-100"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </nav>
        </div>

        {/* ---- Payment, region ---- */}
        <div
          className={`${brand.rule} flex flex-col gap-4 border-t py-6 tablet:flex-row tablet:items-center tablet:justify-between`}
        >
          <ul aria-label="Ways to pay" className="flex flex-wrap gap-2">
            {footerMeta.paymentMarks.map((mark) => (
              <li
                key={mark}
                className={`${brand.label} border px-2.5 py-1 text-[0.625rem]`}
                style={{ borderColor: 'rgb(31 59 46 / 0.25)' }}
              >
                {mark}
              </li>
            ))}
          </ul>
          <p className={`${brand.label} opacity-70`}>{COPY.region}</p>
        </div>
      </div>

      {/* ---- Legal bar ---- */}
      <div style={{ background: 'var(--vaapsi-forest)', color: 'var(--vaapsi-natural)' }}>
        <div className="mx-auto flex max-w-[1360px] flex-col gap-3 px-5 py-5 text-xs tablet:flex-row tablet:items-center tablet:justify-between tablet:px-8">
          <p className="opacity-75">{footerMeta.copyright(year)}</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {legal.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="opacity-75 hover:underline hover:opacity-100">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}

function Newsletter() {
  const [state, setState] = useState<'idle' | 'invalid' | 'done'>('idle')

  if (state === 'done') {
    return (
      <p role="status" className="mt-6 text-sm font-medium">
        {COPY.thanks}
      </p>
    )
  }

  return (
    <form
      noValidate
      className="mt-6"
      onSubmit={(event) => {
        event.preventDefault()
        const email = new FormData(event.currentTarget).get('email')
        // Not connected: see the note at the top of this file.
        setState(typeof email === 'string' && /^\S+@\S+\.\S+$/.test(email) ? 'done' : 'invalid')
      }}
    >
      <label htmlFor="footer-email" className="sr-only">
        {COPY.emailLabel}
      </label>
      <div className="flex max-w-md border-b-[1.5px] border-[var(--vaapsi-forest)]">
        <input
          id="footer-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder={COPY.emailPlaceholder}
          aria-invalid={state === 'invalid'}
          aria-describedby={state === 'invalid' ? 'footer-email-error' : undefined}
          className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-[rgb(31_59_46_/_0.45)]"
        />
        <button
          type="submit"
          className={`${brand.label} shrink-0 py-3 pl-4 hover:opacity-70 focus-visible:outline-offset-2`}
        >
          {COPY.submit}
        </button>
      </div>
      {state === 'invalid' ? (
        <p id="footer-email-error" role="alert" className="mt-2 text-xs">
          {COPY.invalid}
        </p>
      ) : null}
    </form>
  )
}
