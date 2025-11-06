# Accessibility and SEO Fixes for News Website

This document provides comprehensive fixes for the diagnostic errors identified in the news website codebase.

## 🔧 ARIA Accessibility Violations

### Problem Overview
The main issue is that ARIA attributes are receiving JavaScript expressions as strings instead of actual boolean values. Screen readers and accessibility tools require proper boolean values for these attributes.

### ❌ Incorrect Pattern
`	sx
// WRONG - This creates string expressions instead of boolean values
aria-expanded="{isOpen}"
aria-selected="{isSelected}"
aria-pressed="{isPressed}"
`

### ✅ Correct Pattern  
`	sx
// CORRECT - These provide actual boolean values
aria-expanded={isOpen}
aria-selected={isSelected}  
aria-pressed={isPressed}
`

---

## Component-Specific Fixes

### 1. LanguageSwitcher.tsx (Line 87)

**Issue:** `aria-expanded="{isOpen}"` instead of proper boolean

**Fix:**
`	sx
// Before
<button
  aria-expanded="{isOpen}"
  className="..."
>
  {/* content */}
</button>

// After  
<button
  aria-expanded={isOpen}
  className="..."
>
  {/* content */}
</button>
`

### 2. LanguageSelector.tsx (Lines 292, 353, 442, 522)

**Issues:** Multiple ARIA violations with `aria-expanded` and `aria-selected`

**Fixes:**
`	sx
// Lines 292 & 353 - Fix aria-expanded
<button
  aria-expanded={isDropdownOpen}
  aria-haspopup="listbox"
  className="..."
>
  {/* content */}
</button>

// Lines 442 & 522 - Fix aria-selected  
<li
  role="option"
  aria-selected={selectedLocale === locale}
  className="..."
>
  {/* content */}
</li>
`

### 3. MobileFooter.tsx (Line 159)

**Issue:** `aria-expanded` string expression

**Fix:**
`	sx
// Before
<button aria-expanded="{isMenuOpen}">

// After
<button aria-expanded={isMenuOpen}>
`

### 4. SearchBar.tsx (Line 374)

**Issue:** `aria-expanded` string expression

**Fix:**
`	sx
// Before  
<button aria-expanded="{showSuggestions}">

// After
<button aria-expanded={showSuggestions}>
`

### 5. ThemeToggle.tsx (Lines 87, 186)

**Issues:** Both `aria-pressed` and `aria-expanded` string expressions

**Fixes:**
`	sx
// Line 87 - Fix aria-pressed
<button
  aria-pressed={theme === 'dark'}
  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
  className="..."
>
  {/* content */}
</button>

// Line 186 - Fix aria-expanded (if dropdown)
<button
  aria-expanded={isThemeMenuOpen}
  aria-haspopup="menu"
  className="..."
>
  {/* content */}
</button>
`

### 6. LazyImage.tsx (Line 442)

**Issues:** Invalid ARIA role expressions and inline styles

**Fixes:**
`	sx
// Before
<img
  role="{imageRole}"
  style="{{display: 'block'}}"
  className="..."
/>

// After
<img
  role="img"
  className="lazy-image block"
  style={undefined} // Remove inline styles
/>
`

**CSS Migration (add to your CSS file):**
`css
.lazy-image.block {
  display: block;
}

.lazy-image {
  max-width: 100%;
  height: auto;
}
`

---

## 🔍 SEO Issues - SEOHead.tsx

### Lines 382 & 388 Fixes

**Issues:** Apple touch icon placement and theme-color compatibility

**Before:**
`	sx
// Problematic structure
<Head>
  <meta name="theme-color" content="#ffffff" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
</Head>
`

**After:**
`	sx
<Head>
  {/* Basic meta tags first */}
  <meta charSet="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  
  {/* Theme color with media query support */}
  <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
  <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
  
  {/* Apple touch icon with proper sizing */}
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
  
  {/* Web manifest */}
  <link rel="manifest" href="/site.webmanifest" />
</Head>
`

## 🧪 Testing Your Fixes

### Accessibility Testing
`ash
# Install accessibility testing tools
npm install -D @axe-core/react axe-playwright
`

### Browser Testing Tools
- Chrome DevTools Lighthouse
- axe DevTools Browser Extension  
- WAVE Web Accessibility Evaluator

---

## 🚀 Implementation Priority

1. **High Priority - ARIA Fixes:** Fix all aria-expanded, aria-selected, and aria-pressed attributes
2. **Medium Priority - LazyImage:** Fix role attributes and migrate inline styles
3. **Medium Priority - SEO:** Update SEOHead component structure
4. **Low Priority - Markdown:** Fix documentation formatting

