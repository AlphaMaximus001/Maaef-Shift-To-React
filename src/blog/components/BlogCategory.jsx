import React, { useMemo, useState } from 'react';
import {
  ChannelBar,
  Ticker,
  GhostWord,
  MonoLabel,
  Pagination,
} from './Shared.jsx';
import { POSTS, CATEGORIES } from '../data/posts.js';

/* ============================================================
   BlogCategory — single-category view, e.g. /blog/category/dispatch
   Differs from BlogIndex by leading with the category name as the title.
   Props:
     category     The active category label (e.g. "DISPATCH")
     posts        Array (defaults to sample data)
     pageSize     Default 8
     onSelectPost (slug) => void
     onSelectCategory  (cat) => void — wire to your router
     LinkComponent
   ============================================================ */

export default function BlogCategory({
  category,
  posts = POSTS,
  pageSize = 8,
  onSelectPost,
  onSelectCategory,
  LinkComponent,
}) {
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => posts.filter((p) => p.cat === category),
    [posts, category]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const titleCase =
    category && category[0] + category.slice(1).toLowerCase();

  return (
    <div className="maaef-blog">
      <section className="m-masthead">
        <GhostWord>{category}</GhostWord>
        <div className="m-masthead__inner">
          <div className="m-masthead__crumb">
            <button
              onClick={() => onSelectCategory?.('ALL')}
              style={{
                background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                color: 'inherit',
              }}
            >
              <MonoLabel size={11}>← ALL POSTS</MonoLabel>
            </button>
            <span className="sep">/</span>
            <MonoLabel tone="text" size={11}>CATEGORY</MonoLabel>
          </div>
          <h1
            className="m-masthead__title"
            style={{ color: 'var(--m-red)', fontSize: 'clamp(64px, 13vw, 130px)' }}
          >
            {titleCase}.
          </h1>
          <div className="m-masthead__meta">
            <MonoLabel tone="text" size={11}>
              {String(filtered.length).padStart(2, '0')} POSTS
            </MonoLabel>
            <MonoLabel size={11}>FILTERED FROM {String(posts.length).padStart(2, '0')}</MonoLabel>
          </div>
        </div>
      </section>

      {/* Category rail */}
      <div className="m-filterbar">
        <div className="m-filterbar__cats">
          <MonoLabel>SWITCH —</MonoLabel>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`m-filterbar__cat ${c === category ? 'is-active' : ''}`}
              onClick={() => onSelectCategory?.(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="m-empty">
          <MonoLabel tone="red">● NO SIGNAL</MonoLabel>
          <p>No posts in this channel yet.</p>
        </div>
      ) : (
        <div className="m-postlist">
          {paged.map((p) => (
            <CategoryPostRow key={p.slug} post={p} onSelect={onSelectPost} LinkComponent={LinkComponent} />
          ))}
        </div>
      )}

      <Pagination page={safePage} totalPages={totalPages} onPage={setPage} />
    </div>
  );
}

function CategoryPostRow({ post, onSelect, LinkComponent }) {
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
        <MonoLabel tone="text" className="m-postlist__read">READ →</MonoLabel>
      </div>
    </Link>
  );
}
