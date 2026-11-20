'use client'

import { useEffect, useRef, useState } from 'react'
import { WORDMARK_GEOMETRY as G } from '../tester/vaapsi-wordmark'
import styles from './splash.module.css'

/**
 * Load splash: the wordmark writes itself on Natural, the infinity in "aa"
 * draws as one line and gets a lap of olive, then the screen slides up.
 *
 * Pure CSS animation on server-rendered markup, so it covers the page from the
 * very first paint, before hydration. Timeline lives in splash.module.css.
 *
 * React only locks scroll while it is up and removes it afterwards. It asks the
 * overlay's own Animation objects whether they have finished, rather than
 * listening for `animationend`: if hydration lands after the slide is already
 * over (slow device, cold dev compile), that event has fired into nothing, and
 * a listener-based splash would stay mounted with scroll locked forever.
 * `animation.finished` resolves immediately in that case.
 *
 * Shows on every load and refresh, by request. To show it once per session,
 * gate the render on sessionStorage.
 */

/** Seconds; feeds the --at / --dur custom properties the CSS reads. */
const t = (at: number, dur: number) =>
  ({ '--at': `${at}s`, '--dur': `${dur}s` }) as React.CSSProperties

const OLIVE = '#6b7f44'

export function Splash() {
  const overlay = useRef<HTMLDivElement>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const el = overlay.current
    if (!el) return
    const root = document.documentElement
    const previous = root.style.overflow
    root.style.overflow = 'hidden'

    let live = true
    // The overlay's own animation only (not the letters'): its exit is last.
    const own = el.getAnimations({ subtree: false })
    Promise.all(own.map((a) => a.finished))
      .catch(() => undefined) // cancelled, e.g. by a test harness: still release
      .finally(() => {
        if (!live) return
        // Unlock here, not in the cleanup: rendering null keeps this component
        // mounted, so the cleanup would not run until the page is left.
        root.style.overflow = previous
        setDone(true)
      })

    return () => {
      live = false
      root.style.overflow = previous
    }
  }, [])

  if (done) return null

  return (
    <div ref={overlay} aria-hidden className={styles.overlay}>
      <svg viewBox={G.viewBox} className={styles.mark} fill="currentColor">
        <defs>
          {/* The v is a filled shape, so it is revealed through a mask whose
              thick centreline stroke is what actually gets "written". */}
          <mask id="splash-v" maskUnits="userSpaceOnUse" x="270" y="280" width="220" height="230">
            <path
              d="M 306.5 292 L 376 490 L 444.5 292"
              pathLength={1}
              fill="none"
              stroke="#fff"
              strokeWidth={48}
              strokeLinejoin="miter"
              strokeMiterlimit={10}
              className={styles.draw}
              style={t(0.15, 0.45)}
            />
          </mask>
        </defs>

        {/* v */}
        <polygon
          points="290,304 323,304 375.5,437 428,304 461,304 393,473 359,473"
          mask="url(#splash-v)"
        />

        {/* aa: the infinity, then its stems, then the olive lap */}
        <path
          d={G.infinity}
          pathLength={1}
          fill="none"
          stroke="currentColor"
          strokeWidth={G.stroke}
          className={styles.draw}
          style={t(0.5, 0.9)}
        />
        <rect x="590" y="448" width="31" height="25" className={styles.grow} style={t(1.3, 0.15)} />
        <rect x="759" y="301" width="31" height="172" className={styles.grow} style={t(1.3, 0.3)} />
        <path
          d={G.infinity}
          pathLength={1}
          fill="none"
          stroke={OLIVE}
          strokeWidth={G.stroke + 1}
          className={styles.comet}
        />

        {/* p */}
        <rect
          x="807"
          y="301"
          width="31"
          height="236"
          className={styles.grow}
          style={t(1.45, 0.3)}
        />
        <circle
          cx="897"
          cy="386"
          r={G.r}
          pathLength={1}
          fill="none"
          stroke="currentColor"
          strokeWidth={G.stroke}
          // Start the bowl where it leaves the stem, top-left, and go clockwise.
          transform="rotate(-160 897 386)"
          className={styles.draw}
          style={t(1.55, 0.45)}
        />

        {/* s */}
        <path
          d={G.s}
          pathLength={1}
          fill="none"
          stroke="currentColor"
          strokeWidth={G.stroke}
          className={styles.draw}
          style={t(1.85, 0.45)}
        />

        {/* i */}
        <rect
          x="1133"
          y="301"
          width="31"
          height="172"
          className={styles.grow}
          style={t(2.15, 0.25)}
        />
      </svg>
    </div>
  )
}
