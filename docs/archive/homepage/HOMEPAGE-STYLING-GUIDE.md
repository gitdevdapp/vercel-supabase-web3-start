# Homepage Styling Guide

## Overview
This guide ensures visual consistency across all homepage sections. All components follow the established design system based on Tailwind CSS with custom color themes for light and dark modes.

## Color System

### Light Mode
- **Background**: `bg-background` (white - 0 0% 100%)
- **Foreground**: `text-foreground` (dark text - 0 0% 3.9%)
- **Muted**: `text-muted-foreground` (gray text - 0 0% 45.1%)
- **Secondary**: `bg-secondary` (light gray - 0 0% 96.1%)
- **Border**: `border-border` (light border - 0 0% 89.8%)
- **Accent**: Uses brand colors (blue, green, amber, purple, etc.)

### Dark Mode
- **Background**: `dark:bg-background` (near black - 0 0% 3.9%)
- **Foreground**: `dark:text-foreground` (white text - 0 0% 98%)
- **Muted**: `dark:text-muted-foreground` (light gray text - 0 0% 63.9%)
- **Secondary**: `dark:bg-secondary` (dark gray - 0 0% 14.9%)
- **Border**: `dark:border-border` (dark border - 0 0% 14.9%)

## Section Structure

### Spacing Pattern
All sections follow this consistent pattern:
```
<section className="py-20 bg-background/muted">
  <div className="container mx-auto px-4 max-w-5xl">
    {/* Content */}
  </div>
</section>
```

**Vertical Spacing**: `py-20` (80px)
**Horizontal Padding**: `px-4` (responsive)
**Max Width**: `max-w-5xl` (64rem - for text-heavy sections)
**Container**: Uses `container` utility for responsive max-width

### Background Variations
- **Default**: `bg-background` (white/dark, no distinction)
- **Subtle**: `bg-muted/20` or `bg-muted/30` (light backgrounds for contrast)
- **Cards**: `bg-card` or `bg-background` with `border`

## Typography

### Heading Hierarchy
- **Section Title (h2)**: `text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground`
  - Responsive sizing: 1.875rem → 2.25rem → 3rem
  - Used for main section headings
  
- **Subsection Title (h3)**: `text-2xl font-bold text-foreground`
  - Used for content subsections
  
- **Label/Small (h4)**: `text-xl font-semibold text-foreground`
  - Used for card titles

### Body Text
- **Primary**: `text-foreground` (regular body text)
- **Secondary**: `text-muted-foreground` (descriptions, labels)
- **Large Intro**: `text-lg lg:text-xl text-muted-foreground font-medium`
  - Used for section introductions

### Text Effects
- **Gradient Text**: `bg-gradient-to-r from-[color]-500 to-[color]-500 bg-clip-text text-transparent`
- **Accent Badges**: `text-sm font-semibold text-[color]-600 dark:text-[color]-400 uppercase tracking-wide`

## Card & Component Patterns

### Standard Card
```tailwind
bg-background rounded-lg p-6 lg:p-8 border border-border
flex flex-col h-full
```
- **Background**: White/dark
- **Radius**: `rounded-lg` (0.5rem)
- **Padding**: `p-6` (mobile) → `lg:p-8` (desktop)
- **Border**: Single `border-border`
- **Height**: Full height for alignment in grids

### Highlighted Card (Featured/Premium)
```tailwind
bg-background rounded-lg p-6 lg:p-8 border-2 border-[color]-600 dark:border-[color]-400 relative
```
- **Border**: Thicker (`border-2`) with accent color
- **Positioning**: `relative` for badge overlay
- **Badge**: Absolute positioned at `top-4 right-4`

### Card with Accent Background
```tailwind
bg-gradient-to-br from-[color]-50 to-[color]-50 dark:from-[color]-950/30 dark:to-[color]-950/30 rounded-lg p-6 border-2 border-[color]-200 dark:border-[color]-800
```
- **Gradient**: Subtle gradient using color-50 (light) or color-950/30 (dark)
- **Border**: Thicker with color-200/800

### Icon Containers
```tailwind
w-12 h-12 bg-[color]/10 rounded-lg flex items-center justify-center
```
- **Size**: `w-12 h-12` (48x48px)
- **Background**: Transparent color (`[color]/10`)
- **Icon**: `text-[color]` or `text-[color]-600 dark:text-[color]-400`

## Grid & Layout

### Common Grid Patterns
- **2 Columns**: `grid grid-cols-1 md:grid-cols-2 gap-8`
- **3 Columns**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8`
- **Full Width**: `grid grid-cols-1 gap-12`

### Gap Values
- **Between Sections**: `gap-20` (80px in flex columns)
- **Within Sections**: `gap-8` or `gap-12` for content grids
- **Tight Content**: `gap-4` or `gap-6`

## Button & Link Patterns

### Primary Button
```tailwind
px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 transition-all font-semibold shadow-lg
```

### Secondary Button (Outline)
```tailwind
px-8 py-3 rounded-lg border-2 border-border text-foreground hover:bg-secondary transition-colors font-semibold
```

### Link Buttons in Cards
```tailwind
inline-flex w-full justify-center py-3 px-4 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors font-semibold text-sm
```

## Icon Usage

### Icon Placement
- **Section Header**: `w-6 h-6` next to uppercase label
- **Card Icons**: `w-6 h-6` within icon container
- **Large Icons**: `w-8 h-8` or `w-10 h-10` for prominent display

### Icon Colors
- **Primary**: `text-blue-600 dark:text-blue-400`
- **Success**: `text-green-500 dark:text-green-400`
- **Warning**: `text-amber-500 dark:text-amber-400`
- **Premium**: `text-purple-600 dark:text-purple-400`

## Decoration & Visual Effects

### Gradient Dividers
```tailwind
w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent
```
- Used to separate major sections
- Subtle effect with transparency

### Accent Borders
```tailwind
border-t border-b border-border pt-12 pb-12
```
- `border-t` or `border-b` for horizontal lines
- Spacing with `pt-` and `pb-`

### Decorative Circles (Background)
```tailwind
absolute top-0 right-0 w-20 h-20 bg-[color]/10 rounded-full -translate-y-10 translate-x-10
```
- Positioned absolutely for layering
- Semi-transparent (`/10` or `/5`)
- Translate offsets for placement

## Dark Mode Handling

### Pattern
Always include dark mode classes:
```tailwind
text-foreground dark:text-foreground
border-border dark:border-border
bg-[color]-600 dark:bg-[color]-400
```

### Border Colors in Dark Mode
- Light: `border-[color]-200`
- Dark: `dark:border-[color]-800`

### Gradient Adjustments
Light mode: `from-blue-600 to-purple-600`
Dark mode: `dark:from-blue-500 dark:to-purple-500`

## Mobile Responsiveness

### Breakpoints
- **Mobile First**: Design for mobile, add larger breakpoints
- **Tablet**: `md:` (768px)
- **Desktop**: `lg:` (1024px)
- **Large Desktop**: `xl:`, `2xl:` for extreme cases

### Common Mobile Patterns
```tailwind
text-3xl md:text-4xl lg:text-5xl          # Typography scaling
grid-cols-1 md:grid-cols-2 lg:grid-cols-3 # Layout shifts
px-4 md:px-6 lg:px-8                     # Padding scaling
gap-6 md:gap-8 lg:gap-12                 # Gap scaling
flex-col sm:flex-row                     # Direction changes
w-full sm:w-auto                         # Width changes
```

## Anti-Patterns to Avoid

❌ **Don't use**:
- Mismatched borders (single on one card, double on another)
- Inconsistent padding across similar components
- Hard-coded colors instead of utility classes
- Different card radius (always use `rounded-lg`)
- Unaligned typography sizing

✅ **Do use**:
- Consistent `border` or `border-2 border-[color]`
- Uniform `p-6 lg:p-8` padding pattern
- Color utilities from the theme
- `rounded-lg` consistently
- Responsive typography that scales

## Example: Consistent Section

```tsx
export function MySection() {
  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-8">
            Section Title
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Description text
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card */}
          <div className="bg-background rounded-lg p-6 border border-border flex flex-col h-full">
            <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center mb-4">
              <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              Card Title
            </h3>
            <p className="text-muted-foreground flex-grow">
              Card description
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
```

## Summary

**Key Consistency Rules**:
1. All sections use `py-20` vertical padding
2. All cards use `rounded-lg` with `border` or `border-2`
3. All text respects the foreground/muted-foreground hierarchy
4. All gradients use brand colors (blue, purple, green, amber)
5. All spacing is multiples of 4px (Tailwind's default)
6. Always include dark mode variants with `dark:` prefix
7. Icons are `w-6 h-6` unless explicitly larger
8. Max-width for text-heavy sections is `max-w-5xl`
