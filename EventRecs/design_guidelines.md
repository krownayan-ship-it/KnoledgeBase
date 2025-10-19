# Knowledge Base Software - Design Guidelines

## Design Approach

**Selected Approach:** Design System with Reference Inspiration  
**Primary System:** Fluent Design with Notion/Linear influences  
**Justification:** Knowledge bases prioritize information density, clarity, and productivity. The clean, functional aesthetic of Notion combined with Linear's precision creates an ideal foundation for a professional knowledge management platform.

**Key Design Principles:**
- Clarity over decoration - every element serves a purpose
- Information hierarchy through typography and spacing
- Efficient navigation patterns for quick content discovery
- Professional, trustworthy aesthetic for enterprise use

## Core Design Elements

### A. Color Palette

**Light Mode:**
- Primary: 220 85% 45% (Professional blue)
- Background: 0 0% 100% (Pure white)
- Surface: 220 20% 97% (Subtle gray)
- Border: 220 13% 91%
- Text Primary: 220 15% 15%
- Text Secondary: 220 10% 45%

**Dark Mode:**
- Primary: 220 85% 55%
- Background: 220 15% 10%
- Surface: 220 15% 13%
- Border: 220 10% 20%
- Text Primary: 220 5% 95%
- Text Secondary: 220 5% 65%

**Accent Colors:**
- Success: 145 65% 45% (Article published)
- Warning: 35 85% 55% (Draft state)
- Error: 0 75% 55% (Validation errors)

### B. Typography

**Font Families:**
- Primary: Inter (headings, UI, body text)
- Monospace: JetBrains Mono (code blocks in articles)

**Type Scale:**
- Display: text-4xl font-bold (Dashboard headers)
- H1: text-3xl font-semibold (Article titles)
- H2: text-2xl font-semibold (Section headers)
- H3: text-xl font-semibold (Subsections)
- Body: text-base (Article content, forms)
- Small: text-sm (Metadata, captions)
- Tiny: text-xs (Timestamps, tags)

### C. Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16  
**Common Patterns:**
- Component padding: p-4 to p-6
- Section spacing: space-y-8
- Card gaps: gap-6
- Page margins: px-6 lg:px-12

**Grid Structure:**
- Main Layout: Sidebar (240px fixed) + Content (flex-1)
- Article Grid: 3-column on desktop, 2 on tablet, 1 on mobile
- Employee Cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3

### D. Component Library

**Navigation:**
- Fixed sidebar with collapsible sections
- Top navigation bar with search, profile, notifications
- Breadcrumb trail for deep navigation
- Sidebar items: flex items-center gap-3 with icons

**Article Components:**
- Rich text editor toolbar (bold, italic, headings, lists, images)
- Article card: Image thumbnail + title + excerpt + metadata (author, date, category)
- Category pills with different colors
- Tag system with small, rounded badges
- Article status indicator (draft/published)

**Employee Management:**
- Employee card: Avatar + name + role + email + actions
- Data table with sortable columns
- Quick action buttons (edit, delete, view profile)
- Role badges with distinct colors

**Forms:**
- Clean input fields with consistent border-2
- Label positioning: above inputs with text-sm font-medium
- Button groups: primary + secondary actions
- Image upload: Drag-drop zone with preview
- Validation states with colored borders and helper text

**Data Display:**
- Stats cards for dashboard (total articles, employees, views)
- Recent activity feed with timestamps
- Search results with highlighted keywords
- Empty states with helpful CTAs

**Overlays:**
- Modal dialogs for confirmations (max-w-md centered)
- Side panels for editing (slide from right, w-96)
- Toast notifications (top-right corner)
- Dropdown menus with shadows

### E. Animations

Use sparingly:
- Sidebar collapse: transition-all duration-200
- Modal entry: fade-in with scale
- Hover states: subtle color transitions only
- NO scroll animations, parallax, or elaborate effects

## Page-Specific Guidelines

**Dashboard:**
- Stats overview (4-column grid)
- Recent articles list
- Quick actions panel
- Activity feed in sidebar

**Article Editor:**
- Clean, distraction-free writing area (max-w-3xl centered)
- Floating toolbar that follows selection
- Image upload with preview and caption fields
- Save draft + Publish buttons in top-right
- Category and tag selectors

**Article Library:**
- Filter sidebar (categories, tags, authors, status)
- Grid view of article cards
- Search bar prominent at top
- Sort options (newest, popular, alphabetical)

**Employee Directory:**
- Search and filter bar
- Grid of employee cards
- Add Employee button (primary, top-right)
- Table view toggle option

**Authentication:**
- Centered card layout (max-w-md)
- Simple, clean forms
- Company logo at top
- Minimal background (subtle gradient or solid color)

## Images

**Hero Image:** No large hero - this is a utility app focused on content  

**Image Placements:**
- Article cards: 16:9 thumbnail images (aspect-ratio-video)
- Article content: Full-width embedded images with captions
- Employee avatars: Circular, 40px (list) to 96px (profile)
- Empty states: Small illustrative icons (not photos)
- Login page: Optional subtle brand illustration in background

**Image Treatment:**
- Rounded corners: rounded-lg for cards, rounded-full for avatars
- Consistent aspect ratios across similar contexts
- Loading states with skeleton screens

## Accessibility & Polish

- Maintain consistent dark mode across ALL inputs and components
- Focus states: ring-2 ring-primary on interactive elements
- Sufficient color contrast (WCAG AA minimum)
- Hover states for all interactive elements
- Loading indicators for async operations
- Keyboard navigation support throughout