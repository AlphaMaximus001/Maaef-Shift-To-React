import React, { useMemo, useState } from 'react';
import {
  ChannelBar,
  Ticker,
  GhostWord,
  MonoLabel,
  Pagination,
  NewsletterStrip,
} from './Shared.jsx';
import { POSTS, CATEGORIES } from '../data/posts.js';

/* ============================================================
   BlogIndex — the main blog listing page.
   - Working category filter (controlled state)
   - Working search (filters title + dek)
   - Working pagination
   Props:
     posts        Array of post objects (defaults to bundled sample data)
     categories   Array of category labels (defaults to bundled list)
     pageSize     Posts per page (default 6)
     onSelectPost (slug) => void   // wire to your router
     LinkComponent  Optional component for nav links (e.g. react-router <Link>)
   ============================================================ */

const PAGE_SIZE_DEFAULT = 6;

export default function BlogIndex({
  posts = POSTS,
  categories = CATEGORIES,
  pageSize = PAGE_SIZE_DEFAULT,
  onSelectPost,
  LinkComponent,
}) {
  const [category, setCategory] = useState('ALL');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (category !== 'ALL' && p.cat !== category) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.dek.toLowerCase().includes(q) ||
        p.cat.toLowerCase().includes(q)
      );
    });
  }, [posts, category, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  function handleCategory(c) {
    setCategory(c);
    setPage(1);
  }
  function handleQuery(e) {
    setQuery(e.target.value);
    setPage(1);
  }

  return (
    <div className="maaef-blog">
      {/* Masthead */}
      <section className="m-masthead">
        <GhostWord>JOURNAL</GhostWord>
        <div className="m-masthead__inner">
          <MonoLabel size={11}>TARGETING — JOURNAL</MonoLabel>
          <h1 className="m-masthead__title">Journal.</h1>
          <p className="m-masthead__dek">
            Field notes, dispatches, and arguments from the studio floor.
            <br />
            Published when there is something to publish.
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <div className="m-filterbar">
        <div className="m-filterbar__cats">
          <MonoLabel>FILTER —</MonoLabel>
          {categories.map((c) => {
            const count = c === 'ALL' ? posts.length : posts.filter((p) => p.cat === c).length;
            return (
              <button
                key={c}
                className={`m-filterbar__cat ${category === c ? 'is-active' : ''}`}
                onClick={() => handleCategory(c)}
              >
                {c}
                {category === c && ` · ${String(count).padStart(2, '0')}`}
              </button>
            );
          })}
        </div>
        <label className="m-filterbar__search">
          <MonoLabel>QUERY ›</MonoLabel>
          <input
            type="search"
            placeholder="search the broadcast_"
            value={query}
            onChange={handleQuery}
            aria-label="Search posts"
          />
        </label>
      </div>

      {/* Post list */}
      {paged.length === 0 ? (
        <div className="m-empty">
          <MonoLabel tone="red">● NO SIGNAL</MonoLabel>
          <p>Nothing matches that query.</p>
        </div>
      ) : (
        <div className="m-postlist">
          {paged.map((p) => (
            <PostRow key={p.slug} post={p} onSelect={onSelectPost} LinkComponent={LinkComponent} />
          ))}
        </div>
      )}

      <Pagination page={safePage} totalPages={totalPages} onPage={setPage} />
    </div>
  );
}

/* --- A single row in the post list --- */
function PostRow({ post, onSelect, LinkComponent }) {
  const Link = LinkComponent || 'a';
  const linkProps = LinkComponent
    ? { to: `/blog/${post.slug}` }
    : { href: `/blog/${post.slug}` };

  function handleClick(e) {
    if (onSelect) {
      e.preventDefault();
      onSelect(post.slug);
    }
  }

  return (
    <Link {...linkProps} className="m-postlist__row" onClick={handleClick}>
      <div className="m-postlist__date">
        <MonoLabel tone="dim" size={11}>N-{post.n}</MonoLabel>
        <MonoLabel>{post.date}</MonoLabel>
      </div>
      <div>
        <MonoLabel tone="red" size={9} className="m-postlist__cat">● {post.cat}</MonoLabel>
        <h2 className="m-postlist__title">{post.title}</h2>
        <p className="m-postlist__dek">{post.dek}</p>
      </div>
      <div className="m-postlist__meta">
        <MonoLabel tone="dim">T-{post.read}</MonoLabel>
        <MonoLabel className="m-postlist__read" tone="text">READ →</MonoLabel>
      </div>
    </Link>
  );
}
