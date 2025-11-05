# SearchBar Component

A comprehensive, feature-rich search bar component built with React, TypeScript, and Tailwind CSS. Includes real-time suggestions, search history, keyboard navigation, and advanced accessibility support.

## Features

- ✅ **Real-time Suggestions**: Async suggestion fetching with debouncing
- ✅ **Search History**: Persistent local storage with management
- ✅ **Keyboard Navigation**: Full arrow key, Enter, and Escape support
- ✅ **Category Filtering**: Dropdown integration for filtered searches
- ✅ **Loading States**: Visual feedback during operations
- ✅ **Clear Functionality**: One-click search clearing
- ✅ **Accessibility**: Full ARIA support and screen reader compatibility
- ✅ **TypeScript**: Complete type safety with comprehensive interfaces
- ✅ **Responsive Design**: Mobile-first approach with touch optimization
- ✅ **Dark Mode**: Automatic theme adaptation
- ✅ **Animations**: Smooth Framer Motion transitions

## Installation

```bash
npm install framer-motion @heroicons/react
```

## Basic Usage

```tsx
import { SearchBar } from '@/components/ui/SearchBar';

function App() {
  const handleSearch = (query: string, category?: string) => {
    console.log('Search:', { query, category });
  };

  return (
    <SearchBar
      placeholder="Search articles..."
      onSearch={handleSearch}
    />
  );
}
```

## Advanced Usage

```tsx
import { SearchBar, SearchSuggestion } from '@/components/ui/SearchBar';
import { Category } from '@/types';

const categories: Category[] = [
  { id: '1', name: 'Technology', slug: 'tech' },
  { id: '2', name: 'Sports', slug: 'sports' },
];

const getSuggestions = async (query: string): Promise<SearchSuggestion[]> => {
  const response = await fetch(`/api/suggestions?q=${query}`);
  return response.json();
};

function AdvancedSearch() {
  return (
    <SearchBar
      placeholder="Search for news, articles, or topics..."
      categories={categories}
      showCategories={true}
      showHistory={true}
      maxSuggestions={8}
      maxHistoryItems={5}
      debounceMs={300}
      onSearch={handleSearch}
      onSuggestionSelect={handleSuggestionSelect}
      onCategoryChange={handleCategoryChange}
      getSuggestions={getSuggestions}
    />
  );
}
```

## Props API

### SearchBarProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placeholder` | `string` | `"Search news articles..."` | Input placeholder text |
| `categories` | `Category[]` | `[]` | Available search categories |
| `suggestions` | `SearchSuggestion[]` | `[]` | External suggestions list |
| `recentSearches` | `SearchHistoryItem[]` | | External search history |
| `isLoading` | `boolean` | `false` | Loading state indicator |
| `showCategories` | `boolean` | `true` | Show category filter dropdown |
| `showHistory` | `boolean` | `true` | Show recent searches |
| `maxSuggestions` | `number` | `8` | Maximum suggestions displayed |
| `maxHistoryItems` | `number` | `5` | Maximum history items shown |
| `debounceMs` | `number` | `300` | Debounce delay in milliseconds |
| `className` | `string` | `""` | Additional CSS classes |
| `onSearch` | `function` | **Required** | Search execution handler |
| `onSuggestionSelect` | `function` | | Suggestion selection handler |
| `onCategoryChange` | `function` | | Category change handler |
| `onClear` | `function` | | Clear button handler |
| `getSuggestions` | `function` | | Async suggestion fetcher |

### SearchSuggestion Interface

```tsx
interface SearchSuggestion {
  id: string;
  text: string;
  type: 'suggestion' | 'article' | 'category' | 'author';
  category?: string;
  count?: number;
  metadata?: {
    articleId?: string;
    categoryId?: string;
    authorId?: string;
  };
}
```

### SearchHistoryItem Interface

```tsx
interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  resultsCount?: number;
}
```

## Event Handlers

### onSearch

Called when a search is executed (Enter key, suggestion selection, etc.).

```tsx
const handleSearch = (query: string, category?: string) => {
  // Execute search with query and optional category filter
  console.log('Search:', { query, category });
};
```

### onSuggestionSelect

Called when a user selects a suggestion from the dropdown.

```tsx
const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
  // Handle suggestion selection
  console.log('Suggestion selected:', suggestion);
};
```

### onCategoryChange

Called when the category filter changes.

```tsx
const handleCategoryChange = (categoryId: string) => {
  // Handle category filter change
  console.log('Category changed:', categoryId);
};
```

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `↓` (Arrow Down) | Move to next suggestion/history item |
| `↑` (Arrow Up) | Move to previous suggestion/history item |
| `Enter` | Select highlighted item or execute search |
| `Escape` | Close dropdown and blur input |
| `Tab` | Navigate to next focusable element |

## Search History Management

The component automatically manages search history using localStorage:

- **Automatic Storage**: Searches are saved automatically
- **Deduplication**: Prevents duplicate entries
- **Size Limit**: Configurable maximum items (default: 10)
- **Persistence**: Survives browser sessions
- **Manual Management**: Clear individual items or entire history

```tsx
// Access history management functions
const { history, addToHistory, clearHistory, removeFromHistory } = useSearchHistory(10);
```

## Accessibility Features

- **ARIA Labels**: All interactive elements have proper labels
- **Role Attributes**: Correct semantic roles for screen readers
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Proper focus handling and indicators
- **Screen Reader**: Optimized for assistive technologies
- **High Contrast**: Support for high contrast modes

## Styling Customization

### Custom CSS Classes

```tsx
<SearchBar
  className="custom-search-bar"
  // ... other props
/>
```

### Tailwind Customization

The component uses Tailwind classes that can be overridden:

```css
.custom-search-bar input {
  @apply border-2 border-purple-500 focus:ring-purple-500;
}

.custom-search-bar [role="listbox"] {
  @apply bg-purple-50 dark:bg-purple-900;
}
```

## Performance Optimizations

- **Debounced Input**: Configurable debounce delay (default: 300ms)
- **Async Suggestions**: Non-blocking suggestion fetching
- **Memoization**: Optimized re-renders with useMemo and useCallback
- **Cleanup**: Proper effect cleanup to prevent memory leaks
- **Lazy Loading**: Suggestions only loaded when needed

## Integration Examples

### With Next.js API Routes

```tsx
const getSuggestions = async (query: string): Promise<SearchSuggestion[]> => {
  try {
    const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to fetch suggestions');
    return await response.json();
  } catch (error) {
    console.error('Suggestion fetch error:', error);
    return [];
  }
};

<SearchBar getSuggestions={getSuggestions} />
```

### With State Management

```tsx
import { useSearchStore } from '@/store/searchStore';

function SearchWithStore() {
  const { 
    query, 
    results, 
    isLoading, 
    executeSearch, 
    clearSearch 
  } = useSearchStore();

  return (
    <SearchBar
      onSearch={executeSearch}
      onClear={clearSearch}
      isLoading={isLoading}
    />
  );
}
```

### With React Query

```tsx
import { useQuery } from '@tanstack/react-query';

function SearchWithQuery() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['suggestions', debouncedQuery],
    queryFn: () => fetchSuggestions(debouncedQuery),
    enabled: debouncedQuery.length > 1,
  });

  return (
    <SearchBar
      suggestions={suggestions}
      isLoading={isLoading}
      onSearch={handleSearch}
    />
  );
}
```

## Best Practices

1. **Debouncing**: Use appropriate debounce timing (200-500ms)
2. **Error Handling**: Implement proper error boundaries
3. **Loading States**: Always show loading feedback
4. **Accessibility**: Test with screen readers
5. **Performance**: Monitor suggestion fetch performance
6. **UX**: Provide clear feedback for empty results

## Browser Support

- ✅ Chrome 88+
- ✅ Firefox 85+
- ✅ Safari 14+
- ✅ Edge 88+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT License - see LICENSE file for details.
