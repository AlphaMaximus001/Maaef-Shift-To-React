import React from 'react';
import { ChannelBar, Ticker, MonoLabel } from './Shared.jsx';
import { getPostBySlug, getNextPost, POSTS } from '../data/posts.js';

/* ============================================================
   BlogPost — single article page.
   Props:
     slug          The post slug to render. Falls back to first post.
     post          OR pass the resolved post object directly.
     postLookup    Optional (slug) => post — for custom data source.
     onSelectPost  (slug) => void
     onShare       (kind, url) => void   kind: 'twitter' | 'linkedin' | 'copy'
     LinkComponent
   ============================================================ */

export default function BlogPost({
  slug,
  post: postProp,
  postLookup,
  onSelectPost,
  onShare,
  LinkComponent,
}) {
  const post =
    postProp ||
    (postLookup ? postLookup(slug) : getPostBySlug(slug)) ||
    POSTS[0];

  const next =
    (postLookup ? null : getNextPost(post.slug)) ||
    POSTS.find((p) => p.slug !== post.slug);

  function share(kind) {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (onShare) return onShare(kind, url);
    if (kind === 'twitter') {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(url)}`,
        '_blank',
        'noopener'
      );
    } else if (kind === 'linkedin') {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        '_blank',
        'noopener'
      );
    } else if (kind === 'copy' && navigator?.clipboard) {
      navigator.clipboard.writeText(url);
    }
  }

  return (
    <article className="maaef-blog">
      {/* Masthead */}
      <section className="m-article-masthead">
        <div className="m-masthead__crumb">
          <a href="/blog" style={{ color: 'inherit', textDecoration: 'none' }}>
            <MonoLabel size={11}>← JOURNAL</MonoLabel>
          </a>
          <span className="sep">/</span>
          <MonoLabel tone="red" size={11}>● {post.cat}</MonoLabel>
        </div>
        <h1 className="m-article-masthead__title">{post.title}</h1>
        <p className="m-article-masthead__dek">{post.dek}</p>

        <div className="m-article-masthead__spec">
          <Spec k="CH"  v={`02.${post.n}`} />
          <Spec k="SIG" v={post.date} />
          <Spec k="LAT" v={post.read} />
          <Spec k="BY"  v={post.author} />
        </div>
      </section>

      {/* Body */}
      <div className="m-article-body">
        {/* Left rail — share + meta */}
        <aside className="m-article-body__rail">
          <MonoLabel>POST N-{post.n}</MonoLabel>
          <div className="m-article-body__share">
            <MonoLabel size={9}>SHARE</MonoLabel>
            <div className="m-article-body__share-list">
              <a href="#" onClick={(e) => { e.preventDefault(); share('twitter'); }}>↗ X / TWITTER</a>
              <a href="#" onClick={(e) => { e.preventDefault(); share('linkedin'); }}>↗ LINKEDIN</a>
              <a href="#" onClick={(e) => { e.preventDefault(); share('copy'); }}>↗ COPY LINK</a>
            </div>
          </div>
        </aside>

        {/* Body prose */}
        <div className="m-article-body__prose">
          {(post.body || []).map((block, i) => {
            if (block.type === 'h') return <h2 key={i}>{block.text}</h2>;
            if (block.type === 'q') return <blockquote key={i}>{block.text}</blockquote>;
            return <p key={i}>{block.text}</p>;
          })}

          {(!post.body || post.body.length === 0) && (
            <p style={{ color: 'var(--m-text-dim)' }}>
              <em>Article body goes here. Wire <code>post.body</code> to your CMS,
              MDX loader, or markdown renderer.</em>
            </p>
          )}

          <div className="m-article-end">
            <MonoLabel>END OF DISPATCH</MonoLabel>
            <MonoLabel tone="red">● 01.00</MonoLabel>
          </div>
        </div>

        <div />
      </div>

      {/* Next dispatch */}
      {next && (
        <a
          className="m-article-next"
          href={`/blog/${next.slug}`}
          onClick={(e) => {
            if (onSelectPost) {
              e.preventDefault();
              onSelectPost(next.slug);
            }
          }}
        >
          <div>
            <MonoLabel>NEXT DISPATCH —</MonoLabel>
            <h3>{next.title}</h3>
            <div style={{ marginTop: 14 }}>
              <MonoLabel>N-{next.n} · {next.cat} · {next.date}</MonoLabel>
            </div>
          </div>
          <MonoLabel tone="text" size={11}>READ →</MonoLabel>
        </a>
      )}
    </article>
  );
}

function Spec({ k, v }) {
  return (
    <div>
      <MonoLabel>{k}</MonoLabel>
      <MonoLabel tone="text">{v}</MonoLabel>
    </div>
  );
}
