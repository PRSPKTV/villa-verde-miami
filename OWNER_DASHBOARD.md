# Owner Dashboard — Implementation Guide

## Overview

The Owner Dashboard is a browser-based management system that gives property owners full control over their vacation rental site. It replaces the need for developer intervention by providing CRUD interfaces for all site content.

**Access:** `/dashboard` (requires authenticated user with `owner` role)

---

## Architecture

### Static-to-Dynamic Migration

Previously, all site content was baked into static JS files at build time (`src/data/*.js`). The dashboard shifts to runtime content by:

1. **Database tables** store all content (properties, blog, FAQ, testimonials, neighborhood, site config)
2. **Data-fetching hooks** replace static imports on public pages
3. **Mutation hooks** provide CRUD operations for the dashboard
4. **RLS policies** ensure public users can only read published content, while owners have full access

### Auth Model

- `user_profiles` table with `role` column (`owner` | `guest`)
- `is_owner()` SQL function used in RLS policies
- `AuthContext` provides `isOwner` flag to React components
- `RequireOwner` component guards all `/dashboard/*` routes

---

## Database Tables (14 migrations)

| Table | Purpose | RLS |
|-------|---------|-----|
| `user_profiles` | User roles + profile data | Self read/update, owner read-all |
| `properties` | Property listings (JSONB-heavy) | Public read published, owner full CRUD |
| `blog_posts` | Blog content with block editor format | Public read published, owner full CRUD |
| `faq_items` | FAQ questions grouped by category | Public read, owner full CRUD |
| `testimonials` | Guest testimonials with ratings | Public read published, owner full CRUD |
| `neighborhood_highlights` | Points of interest near properties | Public read, owner full CRUD |
| `site_content` | Key-value store for misc content (hero, about, CTA, contact) | Public read, owner full CRUD |

Existing tables with owner RLS added: `bookings`, `guest_emails_log`, `calendar_availability`, `contact_submissions`, `newsletter_subscribers`

---

## Dashboard Routes

```
/dashboard                → DashboardOverviewPage    (stats, quick links, upcoming check-ins)
/dashboard/properties     → PropertyListPage         (table with publish toggle, edit/delete)
/dashboard/properties/new → PropertyEditPage         (full property editor, 12 sections)
/dashboard/properties/:id → PropertyEditPage         (edit existing property)
/dashboard/calendar       → CalendarManagementPage   (visual calendar, block/unblock dates)
/dashboard/bookings       → BookingsManagementPage   (search, filter, expand booking details)
/dashboard/content        → ContentManagementPage    (tabbed: Blog, FAQ, Testimonials, Neighborhood, Site Content)
/dashboard/content/blog/new  → BlogEditorPage        (block editor for new posts)
/dashboard/content/blog/:id  → BlogEditorPage        (edit existing posts)
/dashboard/settings       → SettingsPage             (profile, change password)
```

All dashboard routes are lazy-loaded with code splitting.

---

## File Inventory

### Data-Fetching Hooks (public pages)
| File | Replaces |
|------|----------|
| `src/hooks/useProperties.js` | `import { properties }` from static data |
| `src/hooks/useProperty.js` | Array find on static data |
| `src/hooks/useBlogPosts.js` | `import { blogPosts }` from static data |
| `src/hooks/useFAQ.js` | `import { faqData }` from static data |
| `src/hooks/useTestimonials.js` | `import { testimonials }` from static data |
| `src/hooks/useNeighborhood.js` | `import { neighborhood }` from static data |
| `src/hooks/useSiteContent.js` | Hardcoded strings in components |

### Mutation Hooks (dashboard)
| File | Operations |
|------|-----------|
| `src/hooks/usePropertyMutations.js` | createProperty, updateProperty, deleteProperty, togglePublish |
| `src/hooks/useBlogMutations.js` | createPost, updatePost, deletePost, togglePublish |
| `src/hooks/useContentMutations.js` | CRUD for FAQ, testimonials, neighborhood; updateSiteContent |
| `src/hooks/useCalendarMutations.js` | blockDates, unblockDates, toggleDate |

### Dashboard Components
| File | Purpose |
|------|---------|
| `src/components/dashboard/DashboardLayout.jsx` | Sidebar + main content + RequireOwner wrapper |
| `src/components/dashboard/DashboardSidebar.jsx` | Fixed sidebar with nav links, sign out |
| `src/components/dashboard/RequireOwner.jsx` | Auth guard redirecting non-owners |

### Dashboard Pages (10)
| File | Purpose |
|------|---------|
| `src/pages/dashboard/DashboardOverviewPage.jsx` | Stats cards, quick links, upcoming bookings |
| `src/pages/dashboard/PropertyListPage.jsx` | Property table with publish/edit/delete |
| `src/pages/dashboard/PropertyEditPage.jsx` | 12-section property editor with sidebar nav |
| `src/pages/dashboard/CalendarManagementPage.jsx` | Visual calendar, date blocking, Airbnb sync |
| `src/pages/dashboard/BookingsManagementPage.jsx` | Bookings list with search/filter/expand |
| `src/pages/dashboard/ContentManagementPage.jsx` | Tabbed content manager (5 tabs) |
| `src/pages/dashboard/BlogEditorPage.jsx` | Block editor for blog posts |
| `src/pages/dashboard/SettingsPage.jsx` | Profile + password management |

### Modified Files
| File | Change |
|------|--------|
| `src/context/AuthContext.jsx` | Added `isOwner` flag, `fetchRole()` from user_profiles |
| `src/router.jsx` | Added lazy-loaded `/dashboard/*` routes |
| 15 public pages/components | Switched from static imports to Supabase hooks |

---

## Setting Up an Owner Account

1. **Create user** in Supabase Dashboard → Authentication → Users → Add User
2. **Set role** to owner:
   ```sql
   UPDATE user_profiles SET role = 'owner' WHERE id = '<user-uuid>';
   ```
3. Log in at `/login` and navigate to `/dashboard`

---

## Property Editor Sections

The PropertyEditPage provides 12 collapsible form sections:

1. **Basic Info** — name, slug, tagline, description
2. **Location** — address, neighborhood, city, state, zip (JSONB)
3. **Pricing** — nightly rate, cleaning fee, service fee rate, tax rate, minimum stay (JSONB)
4. **Details** — property type, max guests, bedrooms, beds, bathrooms (JSONB)
5. **Amenities** — multi-select from predefined list (TEXT[])
6. **House Rules** — dynamic list of text rules (TEXT[])
7. **Images** — URL + alt text entries with preview (JSONB array)
8. **Check-in Info** — door code, instructions, wifi, parking (JSONB)
9. **Host** — name, superhost status, response time (JSONB)
10. **Rating** — average and count (JSONB)
11. **iCal Sync** — Airbnb iCal URL for calendar sync
12. **Publishing** — toggle published/draft status

---

## Blog Editor

The BlogEditorPage uses a block-based content model stored as JSONB:

**Block types:**
- `paragraph` — text content
- `heading` — text with level (H2, H3, H4)
- `image` — src, alt, caption
- `list` — array of items

Blocks can be reordered, added, and removed. Auto-slug generation from title.

---

## Content Management Tabs

The ContentManagementPage provides 5 tabs:

1. **Blog** — list posts, toggle publish, link to editor, delete
2. **FAQ** — inline edit question/answer, category grouping, add/remove
3. **Testimonials** — card layout, edit name/location/rating/text, add/remove
4. **Neighborhood** — list with edit name/description/distance/category, add/remove
5. **Site Content** — JSON editor for hero, about, CTA, contact, about_snippet blocks

---

## Calendar Management

- Property selector dropdown
- Month navigation with prev/next
- Click individual dates to toggle blocked status
- Select date ranges for bulk blocking/unblocking
- Visual indicators: booked (blue), blocked (red), available (green)
- "Sync Airbnb" button triggers the sync-calendar Edge Function
