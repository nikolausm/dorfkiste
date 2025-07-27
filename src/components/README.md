# Dorfkiste UI Components

This document provides an overview of all UI components in the Dorfkiste application, focusing on the newly implemented UX enhancement components.

## Core UI Components

### Error Handling & Feedback

#### ErrorBoundary
**File:** `/src/components/ErrorBoundary.tsx`

Comprehensive error boundary system with multiple levels of error handling.

**Components:**
- `ErrorBoundary` - Main error boundary component
- `ComponentErrorBoundary` - Wrapper for component-level errors
- `GlobalErrorBoundary` - App-wide error handling

**Features:**
- Development vs. production error display
- Retry functionality
- Custom fallback UI support
- Accessibility compliant (WCAG AA)

**Usage:**
```tsx
<GlobalErrorBoundary>
  <App />
</GlobalErrorBoundary>

<ComponentErrorBoundary>
  <SomeComponent />
</ComponentErrorBoundary>
```

#### Toast System
**File:** `/src/components/Toast.tsx`

Modern toast notification system with contextual messaging.

**Components:**
- `ToastProvider` - Context provider for toast management
- `useToast` - React hook for toast operations

**Features:**
- 4 toast types: success, error, warning, info
- Auto-dismiss with configurable duration
- Accessible (aria-live regions)
- Animation support
- Action buttons support

**Usage:**
```tsx
const { success, error, warning, info } = useToast()

success('Item successfully saved')
error('Failed to save item', 'Please try again later')
```

### Loading States & Skeletons

#### LoadingSpinner
**File:** `/src/components/LoadingSpinner.tsx`

Intelligent loading indicators with multiple variants.

**Components:**
- `LoadingSpinner` - Basic spinner with text
- `ProgressIndicator` - Multi-step progress tracking
- `ButtonLoading` - Loading state for buttons

**Features:**
- 3 sizes: sm, md, lg
- Screen reader support
- Step-by-step progress visualization
- Button integration with disabled states

**Usage:**
```tsx
<LoadingSpinner size="md" text="Loading items..." />
<ProgressIndicator currentStep={2} totalSteps={5} />
<ButtonLoading loading={isSubmitting}>Submit</ButtonLoading>
```

#### Skeleton Components
**File:** `/src/components/Skeleton.tsx`

Skeleton loading states for various content types.

**Components:**
- `Skeleton` - Base skeleton component
- `ItemCardSkeleton` - Item card placeholder
- `DetailPageSkeleton` - Detail page placeholder
- `ProfileSkeleton` - Profile page placeholder
- `ListSkeleton` - List view placeholder
- `TableSkeleton` - Table placeholder
- `FormSkeleton` - Form placeholder

**Features:**
- Responsive design
- Accessibility hidden
- Realistic content proportions
- Consistent animation

**Usage:**
```tsx
{loading ? (
  <ListSkeleton count={6} />
) : (
  <ItemList items={items} />
)}
```

### Review & Rating System

#### RatingStars
**File:** `/src/components/RatingStars.tsx`

Interactive and display rating component with accessibility support.

**Components:**
- `RatingStars` - Main rating component
- `CompactRating` - Compact display variant

**Features:**
- Interactive rating input
- Keyboard navigation support
- Half-star display capability
- Size variants (sm, md, lg)
- Review count display
- WCAG AA compliant

**Usage:**
```tsx
{/* Display only */}
<RatingStars rating={4.5} showCount reviewCount={23} />

{/* Interactive */}
<RatingStars 
  rating={userRating} 
  interactive 
  onRatingChange={setUserRating} 
/>

{/* Compact version */}
<CompactRating rating={4.2} reviewCount={15} />
```

#### ReviewCard
**File:** `/src/components/ReviewCard.tsx`

Review display component with user interaction capabilities.

**Components:**
- `ReviewCard` - Full review display
- `CompactReviewCard` - Compact variant

**Features:**
- User avatar display
- Helpful/not helpful voting
- Report functionality
- Relative timestamp
- Responsive design
- Accessibility compliant

**Usage:**
```tsx
<ReviewCard
  review={review}
  onHelpfulVote={handleHelpfulVote}
  onReport={handleReport}
/>
```

#### ReviewForm
**File:** `/src/components/ReviewForm.tsx`

Review submission form with validation and guidelines.

**Components:**
- `ReviewForm` - Full review form
- `CompactReviewForm` - Compact variant

**Features:**
- Rating and comment validation
- Character count display
- Authentication check
- Loading states
- Review guidelines
- Form accessibility

**Usage:**
```tsx
<ReviewForm
  itemId={item.id}
  onSubmit={handleReviewSubmit}
  onCancel={handleCancel}
/>
```

#### ReviewList
**File:** `/src/components/ReviewList.tsx`

Complete review listing with filtering and sorting.

**Features:**
- Review summary with rating distribution
- Sorting options (newest, helpful, rating)
- Rating filtering
- Load more functionality
- Responsive design

**Usage:**
```tsx
<ReviewList
  reviews={reviews}
  summary={reviewSummary}
  onHelpfulVote={handleVote}
  onLoadMore={loadMoreReviews}
  hasMore={hasMoreReviews}
/>
```

### Search & Filter System

#### AdvancedSearch
**File:** `/src/components/AdvancedSearch.tsx`

Comprehensive search component with multiple filter options.

**Features:**
- Basic and advanced search modes
- URL parameter synchronization
- Filter persistence
- Category filtering
- Price range selection
- Location-based search
- Rating filters
- Sort options
- Responsive design

**Usage:**
```tsx
<AdvancedSearch
  onSearch={handleSearch}
  categories={categories}
  initialFilters={currentFilters}
/>
```

#### FilterSidebar
**File:** `/src/components/FilterSidebar.tsx`

Sidebar filter component for detailed filtering options.

**Features:**
- Collapsible sections
- Category filtering with counts
- Price range selection
- Condition filtering
- Rating filtering
- Location search
- Mobile-responsive
- Filter count display

**Usage:**
```tsx
<FilterSidebar
  filters={currentFilters}
  onFiltersChange={setFilters}
  categories={categories}
  isMobile={isMobile}
  onClose={closeSidebar}
/>
```

## Accessibility Features

All components implement WCAG 2.1 AA compliance:

- **Keyboard Navigation:** Full keyboard support for interactive elements
- **Screen Reader Support:** Proper ARIA labels and roles
- **Focus Management:** Visible focus indicators and logical tab order
- **Color Contrast:** Minimum 4.5:1 contrast ratio
- **Alternative Text:** Meaningful alt text for images
- **Live Regions:** Dynamic content announcements
- **Semantic HTML:** Proper heading hierarchy and landmarks

## Mobile-First Design

All components are built with mobile-first responsive design:

- **Breakpoints:** sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch Targets:** Minimum 44px tap targets
- **Responsive Typography:** Fluid text sizing
- **Flexible Layouts:** CSS Grid and Flexbox
- **Performance:** Optimized for mobile networks

## Usage Examples

### Item Detail Page Integration
```tsx
import { DetailPageSkeleton } from '@/components/Skeleton'
import ReviewList from '@/components/ReviewList'
import ReviewForm from '@/components/ReviewForm'
import { ComponentErrorBoundary } from '@/components/ErrorBoundary'

function ItemDetailPage({ itemId }: { itemId: string }) {
  const [item, setItem] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  if (loading) return <DetailPageSkeleton />

  return (
    <div>
      {/* Item details */}
      
      <ComponentErrorBoundary>
        <ReviewList 
          reviews={reviews}
          summary={reviewSummary}
          onHelpfulVote={handleHelpfulVote}
        />
        
        <ReviewForm
          itemId={itemId}
          onSubmit={handleReviewSubmit}
        />
      </ComponentErrorBoundary>
    </div>
  )
}
```

### Search Page Integration
```tsx
import AdvancedSearch from '@/components/AdvancedSearch'
import FilterSidebar from '@/components/FilterSidebar'
import { ListSkeleton } from '@/components/Skeleton'

function SearchPage() {
  const [filters, setFilters] = useState({})
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <aside className="lg:col-span-1">
        <FilterSidebar
          filters={filters}
          onFiltersChange={setFilters}
          categories={categories}
        />
      </aside>
      
      <main className="lg:col-span-3">
        <AdvancedSearch
          onSearch={handleSearch}
          initialFilters={filters}
        />
        
        {loading ? (
          <ListSkeleton count={12} />
        ) : (
          <ItemGrid items={results} />
        )}
      </main>
    </div>
  )
}
```

## Testing

All components include comprehensive testing:

- **Unit Tests:** Component behavior and props
- **Integration Tests:** Component interactions
- **Accessibility Tests:** Screen reader and keyboard testing
- **Visual Regression Tests:** UI consistency

Test files are located in `/src/components/__tests__/`

## Performance Considerations

- **Code Splitting:** Components are optimized for lazy loading
- **Bundle Size:** Minimal external dependencies
- **Rendering Performance:** Optimized re-renders with React.memo
- **Accessibility Performance:** Efficient ARIA updates

## Future Enhancements

Planned improvements:
- **Dark Mode Support:** System and manual theme switching
- **Internationalization:** Multi-language support
- **Advanced Animations:** Micro-interactions and transitions
- **Offline Support:** Progressive Web App features