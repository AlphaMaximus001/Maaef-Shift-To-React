# Maaef Journal — React blog package

Direction A from the design exploration, packaged for production.
Drop the `blog/` folder into your React app, import the CSS once, and use the three components.

## Files

```
blog/
  index.js                      ← public exports
  blog.css                      ← all styles (tokens + responsive)
  data/
    posts.js                    ← sample posts + helpers
  components/
    Shared.jsx                  ← ChannelBar, Ticker, MonoLabel, etc.
    BlogIndex.jsx               ← /blog
    BlogCategory.jsx            ← /blog/category/:slug
    BlogPost.jsx                ← /blog/:slug
```

## 1. Install the styles

Import the stylesheet **once** at your app root (or wherever you import global CSS):

```jsx
import './blog/blog.css';
```

All styles are scoped under `.maaef-blog`, so they won't bleed onto the rest of your site.

## 2. Wire the three pages

The components don't pull in a router — they expose `LinkComponent` and `onSelectPost` / `onSelectCategory` props so they slot into **whatever routing setup you already use** (React Router, Next.js, TanStack Router, plain anchors). Two integration patterns:

### Option A — React Router v6

```jsx
import { Link, useParams, useNavigate } from 'react-router-dom';
import { BlogIndex, BlogCategory, BlogPost, getPostBySlug } from './blog';

function BlogIndexRoute() {
  const navigate = useNavigate();
  return (
    <BlogIndex
      LinkComponent={Link}
      onSelectPost={(slug) => navigate(`/blog/${slug}`)}
    />
  );
}

function BlogCategoryRoute() {
  const { slug } = useParams();
  const navigate = useNavigate();
  return (
    <BlogCategory
      category={slug.toUpperCase()}
      LinkComponent={Link}
      onSelectPost={(s) => navigate(`/blog/${s}`)}
      onSelectCategory={(c) =>
        navigate(c === 'ALL' ? '/blog' : `/blog/category/${c.toLowerCase()}`)
      }
    />
  );
}

function BlogPostRoute() {
  const { slug } = useParams();
  const navigate = useNavigate();
  return (
    <BlogPost
      slug={slug}
      LinkComponent={Link}
      onSelectPost={(s) => navigate(`/blog/${s}`)}
    />
  );
}

// In your <Routes>:
// <Route path="/blog" element={<BlogIndexRoute />} />
// <Route path="/blog/category/:slug" element={<BlogCategoryRoute />} />
// <Route path="/blog/:slug" element={<BlogPostRoute />} />
```

### Option B — Next.js (app router)

```jsx
// app/blog/page.jsx
'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BlogIndex } from '@/blog';

export default function Page() {
  const router = useRouter();
  return (
    <BlogIndex
      LinkComponent={Link}
      onSelectPost={(slug) => router.push(`/blog/${slug}`)}
    />
  );
}
```

```jsx
// app/blog/[slug]/page.jsx
import { BlogPost } from '@/blog';
export default function Page({ params }) {
  return <BlogPost slug={params.slug} />;
}
```

## 3. Plug in your data

Replace `blog/data/posts.js` with your real source. Each post needs this shape:

```ts
{
  n:      '07',                 // display number, e.g. "N-07"
  slug:   'we-made-it-louder',  // URL key
  date:   '26.05.26',           // freeform display string
  cat:    'DISPATCH',           // category (uppercase by convention)
  title:  '...',
  dek:    '...',                // subtitle / summary
  read:   '07m',                // reading time
  author: 'M. RIZVI',
  body:   [                     // article blocks
    { type: 'p', text: '...' }, // paragraph
    { type: 'h', text: '...' }, // heading
    { type: 'q', text: '...' }, // pull quote
  ],
}
```

If you have an MDX/Markdown pipeline, render `<BlogPost post={post}>` and replace the `(post.body || []).map(...)` block in `BlogPost.jsx` with your MDX component.

## Component props (quick reference)

### `<BlogIndex>`
| Prop | Default | Notes |
|---|---|---|
| `posts` | sample data | Array of posts |
| `categories` | sample list | Array of category strings |
| `pageSize` | 6 | Posts per page |
| `onSelectPost(slug)` | — | Wire to your router |
| `LinkComponent` | `'a'` | e.g. react-router `<Link>` |

Includes working **search** (filters title + dek + category) and **pagination**.

### `<BlogCategory>`
| Prop | Default | Notes |
|---|---|---|
| `category` | required | e.g. `'DISPATCH'` |
| `posts` | sample data | |
| `pageSize` | 8 | |
| `onSelectPost(slug)` | — | |
| `onSelectCategory(cat)` | — | Fires when user switches channel |
| `LinkComponent` | `'a'` | |

### `<BlogPost>`
| Prop | Default | Notes |
|---|---|---|
| `slug` | — | Looks up post in `POSTS` |
| `post` | — | OR pass the resolved post object directly |
| `postLookup(slug)` | — | OR your own fetcher (e.g. `getMDXBySlug`) |
| `onSelectPost(slug)` | — | For the "next dispatch" link |
| `onShare(kind, url)` | builtin | Override the share handler |
| `LinkComponent` | `'a'` | |

## Customising

- **Colors**: tokens live at the top of `blog.css` as CSS custom properties (`--m-bg`, `--m-red`, etc). Override them on `.maaef-blog`.
- **Display font**: change `--m-font-display`. Current is *Saira Condensed Italic* as a free approximation — swap to your real Maaef display font when ready.
- **Logo**: `<LogoMark>` in `Shared.jsx` is a placeholder SVG. Drop your real mark in.
- **Ticker contents**: pass `<Ticker items={['CUSTOM', 'STRINGS']}>` if you want different broadcast labels.
- **Nav links**: pass `nav={[{label: 'INDEX', href: '/'}, …]}` to `<ChannelBar>`.

## Accessibility notes

- Search input is a `<input type="search">` with `aria-label`.
- Pagination uses `aria-current="page"` on the active page.
- Post rows are full-row `<a>` tags so the entire row is clickable.
- Color contrast on body text (`#EFE9DD` on `#0A0A0A`) passes WCAG AA.

## Open questions

- Real images on the index — currently text-only as you preferred. Easy to add a featured-image variant if you want.
- Author page wasn't in scope. Say the word if you want one in the same vocabulary.
- The display font is Saira Condensed Italic (Google Fonts). If you have the licensed Maaef display font, swap `--m-font-display` and remove the `@import`.
