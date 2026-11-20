'use client'

import { useState } from 'react'
import Link from 'next/link'
import { footerMeta, footerNav } from '@/content/navigation'
import { VaapsiWordmark } from '../tester/vaapsi-wordmark'
import { kitInputClass } from './kit'

/**
 * Footer in kit elements: an Input Field + primary button for the newsletter,
 * the site's existing link columns, outline chips for the ways to pay, and
 * the wordmark in Forest at header size.
 *
 * The newsletter form is NOT connected to a mailing list. It validates and
 * confirms, but nothing is stored or sent.
 */
export function Alt2Footer() {
  const year = new Date().getUTCFullYear()
  const columns = footerNav.filter((g) => g.heading !== 'Legal')
  const legal = footerNav.find((g) => g.heading === 'Legal')?.items ?? []

  return (
    <footer className="mt-16 bg-[var(--natural)] desktop:mt-24">
      <div className="mx-auto max-w-[1280px] px-4 py-14 tablet:px-8 desktop:py-16">
        <div className="grid gap-12 desktop:grid-cols-12 desktop:gap-8">
          <div className="desktop:col-span-5">
            <Link
              href="/alt-2"
              aria-label="Vaapsi home"
              className="inline-block text-[var(--forest)]"
            >
              <VaapsiWordmark className="block h-auto w-[130px]" />
            </Link>
            <h2 className="mt-8 text-[1.5rem] font-medium">Get first look at new drops</h2>
            <p className="mt-2 max-w-[40ch] text-[var(--muted)]">One email a fortnight, at most.</p>
            <Newsletter />
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-x-6 gap-y-10 tablet:grid-cols-4 desktop:col-span-7"
          >
            {columns.map((group) => (
              <div key={group.heading}>
                <h2 className="font-medium">{group.heading}</h2>
                <ul className="mt-4 space-y-3">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-[0.95rem] text-[var(--muted)] transition-colors hover:text-[var(--rust)]"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <ul aria-label="Ways to pay" className="mt-12 flex flex-wrap gap-2">
          {footerMeta.paymentMarks.map((mark) => (
            <li
              key={mark}
              className="inline-flex h-9 items-center rounded-full border-[1.5px] border-[var(--rule)] px-4 text-sm text-[var(--rust)]"
            >
              {mark}
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-col gap-3 border-t border-[var(--rule)] pt-6 text-sm text-[var(--muted)] tablet:flex-row tablet:items-center tablet:justify-between">
          <p>{footerMeta.copyright(year)}</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {legal.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-[var(--rust)]">
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
      <p role="status" className="mt-6 font-medium text-[var(--rust)]">
        You are on the list.
      </p>
    )
  }

  return (
    <form
      noValidate
      className="mt-6 flex max-w-md gap-3"
      onSubmit={(e) => {
        e.preventDefault()
        const email = new FormData(e.currentTarget).get('email')
        // Not connected: see the note at the top of this file.
        setState(typeof email === 'string' && /^\S+@\S+\.\S+$/.test(email) ? 'done' : 'invalid')
      }}
    >
      <label htmlFor="alt2-email" className="sr-only">
        Email address
      </label>
      <div className="flex-1">
        <input
          id="alt2-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="Email address"
          aria-invalid={state === 'invalid'}
          aria-describedby={state === 'invalid' ? 'alt2-email-error' : undefined}
          className={`${kitInputClass} px-4`}
        />
        {state === 'invalid' ? (
          <p id="alt2-email-error" role="alert" className="mt-2 text-sm text-[var(--rust)]">
            That does not look like an email address.
          </p>
        ) : null}
      </div>
      <button
        type="submit"
        className="h-[52px] shrink-0 rounded-2xl bg-[var(--rust)] px-6 font-medium text-[var(--paper)] transition-colors hover:bg-[var(--rust-deep)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rust)]"
      >
        Sign Up
      </button>
    </form>
  )
}
