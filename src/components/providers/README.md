# Theme Provider Usage Examples

## Basic setup in your app

1. Wrap your app with ThemeProvider (in app/layout.tsx or pages/_app.tsx):

```tsx
import { ThemeProvider } from '@/components/providers';
import '@/styles/theme.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

1. Use theme hooks in your components:

```tsx
import { useCustomTheme, useThemeToggle } from '@/components/providers';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

function MyComponent() {
  const { theme, resolvedTheme, isLight, isDark } = useCustomTheme();
  const { toggleTheme } = useThemeToggle();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <p>Resolved theme: {resolvedTheme}</p>
      <p>Is light mode: {isLight ? 'Yes' : 'No'}</p>
      
      {/* Theme toggle components */}
      <ThemeToggle variant="minimal" />
      <ThemeToggle variant="compact" showLabel />
      <ThemeToggle variant="default" showLabel />
    </div>
  );
}
```

1. Advanced configuration:

```tsx
<ThemeProvider
  config={{
    themes: ['light', 'dark', 'system'],
    defaultTheme: 'system',
    enableSystem: true,
    storageKey: 'my-app-theme',
    attribute: 'data-theme',
  }}
>
  {children}
</ThemeProvider>
```

1. Using theme variables in CSS:

```css
.my-component {
  background-color: hsl(var(--color-background));
  color: hsl(var(--color-text-primary));
  border: 1px solid hsl(var(--color-border));
}

.my-component:hover {
  background-color: hsl(var(--color-surface-hover));
}
```

1. Using theme classes:

```tsx
<div className="bg-theme-background text-theme-primary border-theme">
  This uses theme-aware classes
</div>
```

## Available hooks

- useCustomTheme(): Main theme hook with all functionality
- useThemeToggle(): Simple toggle functionality
- useThemeDetection(): Theme detection and state information

## Available components

- `ThemeToggle`: Customizable theme toggle button
- `ThemeSelector`: Dropdown theme selector

## Theme variables

All CSS custom properties are automatically updated when theme changes:

- --color-primary, --color-secondary
- --color-background, --color-surface
- --color-text-primary, --color-text-secondary
- --color-border, --color-accent
- --shadow-sm, --shadow-md, --shadow-lg, --shadow-xl
- And many more...
