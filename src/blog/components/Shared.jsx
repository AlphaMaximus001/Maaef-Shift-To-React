import React from 'react';

/* ============================================================
   Shared atoms used across the Maaef Journal pages.
   Keep these dumb / presentational. State lives in the pages.
   ============================================================ */

/** Tiny mono label — spec-sheet voice. */
export function MonoLabel({ tone = 'mut', size = 10, children, className = '', ...rest }) {
  const toneClass =
    tone === 'red'  ? 'is-red'
    : tone === 'text' ? 'is-text'
    : tone === 'dim'  ? 'is-dim'
    : '';
  const sizeClass = size === 11 ? 'is-11' : size === 9 ? 'is-9' : '';
  return (
    <span className={`m-mono ${toneClass} ${sizeClass} ${className}`.trim()} {...rest}>
      {children}
    </span>
  );
}

/** The "M" logo mark, simplified. Swap in your real SVG asset when ready. */
export function LogoMark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <path
        d="M4 34 L4 8 L20 28 L36 8 L36 34"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="square"
        strokeLinejoin="miter"
        fill="none"
        style={{ transform: 'skewX(-8deg)', transformOrigin: 'center' }}
      />
    </svg>
  );
}

/**
 * Top channel bar. Pass `right` to change the right-side channel label.
 * `homeHref` / `linkComponent` let you wire in react-router <Link> if you want.
 */
export function ChannelBar({
  left = 'N-02',
  right = 'CH-02 / JOURNAL — POSTS',
  nav = [
    { label: 'INDEX', href: '/' },
    { label: 'WORK',  href: '/work' },
    { label: 'ABOUT', href: '/about' },
  ],
  LinkComponent = 'a',
}) {
  const Link = LinkComponent;
  return (
    <header className="m-channel-bar">
      <div className="m-channel-bar__left">
        <Link to="/" href="/" style={{ color: 'inherit', display: 'flex' }}>
          <LogoMark />
        </Link>
        <MonoLabel size={9}>{left} / JOURNAL</MonoLabel>
      </div>
      <div className="m-channel-bar__right">
        <nav className="m-channel-bar__nav">
          {nav.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              href={item.href}
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              <MonoLabel>{item.label}</MonoLabel>
            </Link>
          ))}
        </nav>
        <MonoLabel tone="red">{right}</MonoLabel>
        <button
          aria-label="Open menu"
          className="m-channel-bar__menu"
          style={{ background: 'none', border: 'none', padding: 0 }}
          onClick={() => {
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("MAAEF_TOGGLE_MENU"));
            }
          }}
        >
          <span /><span />
        </button>
      </div>
    </header>
  );
}

/** Bottom marquee — the running broadcast ticker. */
export function Ticker({ items }) {
  const list = items || [
    'CH 02 · JOURNAL',
    'LIVE',
    'LUCKNOW 26.8467° N · 81.0307° E',
    'ATTENTION ENGINE V2.4',
    'SECTOR 2 GREEN',
    'NO INVESTORS',
    'EST. 2018',
    'BROADCAST STABLE',
  ];
  return (
    <footer className="m-ticker" aria-hidden>
      {list.map((t, i) => (
        <React.Fragment key={i}>
          {t === 'LIVE' ? (
            <span className="m-ticker__item is-live">
              <span className="dot" />
              LIVE
            </span>
          ) : (
            <span className="m-ticker__item">{t}</span>
          )}
          {i < list.length - 1 && <span className="m-ticker__sep">—</span>}
        </React.Fragment>
      ))}
    </footer>
  );
}

/** Huge ghost word behind a masthead. (Like "ORIGIN" on the main site.) */
export function GhostWord({ children, top = 20, left = -40 }) {
  return (
    <div className="m-masthead__ghost" style={{ top, left }}>
      {children}
    </div>
  );
}

/** Standard pagination — controlled. */
export function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  return (
    <nav className="m-pagination" aria-label="Pagination">
      <button onClick={() => onPage(page - 1)} disabled={page <= 1}>← PREV</button>
      <div className="m-pagination__pages">
        {Array.from({ length: totalPages }).map((_, i) => {
          const p = i + 1;
          return (
            <button
              key={p}
              className={p === page ? 'is-active' : ''}
              onClick={() => onPage(p)}
              aria-current={p === page ? 'page' : undefined}
            >
              {String(p).padStart(2, '0')}
            </button>
          );
        })}
      </div>
      <button onClick={() => onPage(page + 1)} disabled={page >= totalPages}>NEXT →</button>
    </nav>
  );
}

/** Newsletter signup strip. Hand it an `onSubscribe(email)` callback. */
export function NewsletterStrip({ onSubscribe }) {
  const [email, setEmail] = React.useState('');
  const [done, setDone] = React.useState(false);
  function submit(e) {
    e.preventDefault();
    if (!email.includes('@')) return;
    onSubscribe?.(email);
    setDone(true);
  }
  return (
    <section className="m-newsletter">
      <div className="m-newsletter__copy">
        <MonoLabel tone="red">● SUBSCRIBE</MonoLabel>
        <h3>One dispatch. Once a month. No noise.</h3>
      </div>
      <form className="m-newsletter__form" onSubmit={submit}>
        <input
          type="email"
          placeholder="your.signal@domain"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email address"
        />
        <button type="submit">{done ? 'TUNED IN ✓' : 'TUNE IN →'}</button>
      </form>
    </section>
  );
}
