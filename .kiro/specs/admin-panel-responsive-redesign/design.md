# Admin Panel Responsive Redesign - Design Document

## Architecture Overview

Responsive redesign će biti implementiran kroz:
1. Tailwind utility classes (mobile-first approach)
2. Custom responsive components
3. Adaptive layouts za različite breakpoints
4. Touch-optimized interactions

## Design System

### Breakpoint Strategy

```typescript
// Mobile First Approach
const breakpoints = {
  mobile: '320px - 767px',    // Default (no prefix)
  tablet: '768px - 1023px',   // md: prefix
  desktop: '1024px+',         // lg: prefix
  wide: '1280px+',            // xl: prefix
  ultrawide: '1536px+'        // 2xl: prefix
}
```

### Typography System

```typescript
// Professional font sizes - ne preterivati!
const typography = {
  // Headings
  h1: {
    mobile: 'text-xl',      // 20px
    tablet: 'md:text-2xl',  // 24px
    desktop: 'lg:text-3xl'  // 28px
  },
  h2: {
    mobile: 'text-lg',      // 18px
    tablet: 'md:text-xl',   // 20px
    desktop: 'lg:text-2xl'  // 22px
  },
  h3: {
    mobile: 'text-base',    // 16px
    tablet: 'md:text-lg',   // 18px
    desktop: 'lg:text-xl'   // 20px
  },
  
  // Body text
  body: {
    mobile: 'text-sm',      // 14px
    tablet: 'md:text-base', // 15px (custom)
    desktop: 'lg:text-base' // 16px
  },
  
  // Small text
  small: {
    mobile: 'text-xs',      // 12px
    tablet: 'md:text-sm',   // 13px (custom)
    desktop: 'lg:text-sm'   // 14px
  },
  
  // Buttons
  button: {
    mobile: 'text-sm',      // 14px
    tablet: 'md:text-base', // 15px
    desktop: 'lg:text-base' // 16px
  }
}
```

### Spacing System

```typescript
const spacing = {
  // Container padding
  container: {
    mobile: 'px-4',    // 16px
    tablet: 'md:px-6', // 24px
    desktop: 'lg:px-8' // 32px
  },
  
  // Gap between elements
  gap: {
    tight: 'gap-2',    // 8px
    normal: 'gap-4',   // 16px
    loose: 'gap-6'     // 24px
  },
  
  // Section spacing
  section: {
    mobile: 'space-y-4',    // 16px
    tablet: 'md:space-y-6', // 24px
    desktop: 'lg:space-y-8' // 32px
  }
}
```

### Grid System

```typescript
const grids = {
  stats: {
    mobile: 'grid-cols-1',
    tablet: 'md:grid-cols-2',
    desktop: 'lg:grid-cols-4'
  },
  
  forms: {
    mobile: 'grid-cols-1',
    tablet: 'md:grid-cols-2',
    desktop: 'lg:grid-cols-2' // Keep 2 columns even on desktop
  },
  
  checkboxes: {
    mobile: 'grid-cols-1',
    tablet: 'md:grid-cols-2',
    desktop: 'lg:grid-cols-3'
  },
  
  images: {
    mobile: 'grid-cols-2',
    tablet: 'md:grid-cols-4',
    desktop: 'lg:grid-cols-4'
  }
}
```

## Component Redesigns

### 1. AdminDashboard

**Current Issues:**
- Tabs overflow na mobile
- Stats cards ne staju
- Horizontal scroll

**Solution:**

```tsx
// Responsive tabs with horizontal scroll
<div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
  <TabsList className="inline-flex min-w-full md:grid md:grid-cols-5 w-full">
    <TabsTrigger value="dashboard" className="text-sm md:text-base">
      Dashboard
    </TabsTrigger>
    {/* ... */}
  </TabsList>
</div>

// Responsive stats grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Stats cards */}
</div>
```

**Layout:**
- Mobile: Tabs scrollable horizontalno, stats 1 kolona
- Tablet: Tabs grid 5 kolona, stats 2 kolone
- Desktop: Full layout, stats 4 kolone

### 2. EnhancedApartmentManager

**Current Issues:**
- 5 tabs ne staju na mobile
- Forms prešroke
- Checkbox lists overflow

**Solution:**

```tsx
// Scrollable tabs
<div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
  <TabsList className="inline-flex min-w-full md:grid md:grid-cols-5">
    <TabsTrigger value="basic" className="whitespace-nowrap text-sm md:text-base">
      Osnovne info
    </TabsTrigger>
    {/* ... */}
  </TabsList>
</div>

// Responsive form grid
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Form fields */}
</div>

// Responsive checkbox grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
  {/* Checkboxes */}
</div>
```

**Layout:**
- Mobile: 1 kolona za sve, tabs scrollable
- Tablet: 2 kolone za forms i checkboxes
- Desktop: 3 kolone za checkboxes, 2 za forms

### 3. BookingList

**Current Issues:**
- Table ne staje na mobile
- Previše kolona
- Actions teško kliknuti

**Solution:**

```tsx
// Desktop: Table
<div className="hidden lg:block overflow-x-auto">
  <table className="w-full">
    {/* Full table */}
  </table>
</div>

// Mobile/Tablet: Card layout
<div className="lg:hidden space-y-4">
  {bookings.map(booking => (
    <Card key={booking.id} className="p-4">
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-base">{booking.guestName}</h3>
            <p className="text-sm text-gray-600">{booking.apartmentName}</p>
          </div>
          <Badge>{booking.status}</Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">Check-in:</span>
            <span className="ml-2 font-medium">{booking.checkIn}</span>
          </div>
          <div>
            <span className="text-gray-600">Check-out:</span>
            <span className="ml-2 font-medium">{booking.checkOut}</span>
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button size="sm" className="flex-1">Detalji</Button>
          <Button size="sm" variant="outline" className="flex-1">Izmeni</Button>
        </div>
      </div>
    </Card>
  ))}
</div>
```

**Layout:**
- Mobile/Tablet: Card layout sa svim info
- Desktop: Full table

### 4. StatsCards

**Current Issues:**
- 8 cards ne staju na mobile
- Previše informacija

**Solution:**

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {stats.map(stat => (
    <Card key={stat.id} className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{stat.label}</p>
          <p className="text-2xl font-bold mt-1">{stat.value}</p>
        </div>
        <div className="text-blue-600">
          {stat.icon}
        </div>
      </div>
    </Card>
  ))}
</div>
```

**Layout:**
- Mobile: 1 kolona (8 cards vertikalno)
- Tablet: 2 kolone (4 rows)
- Desktop: 4 kolone (2 rows)

### 5. ContentEditor

**Current Issues:**
- Language tabs overflow
- Textarea preširok

**Solution:**

```tsx
// Scrollable language tabs
<div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
  <div className="inline-flex gap-2 min-w-full md:w-auto">
    {languages.map(lang => (
      <Button
        key={lang}
        variant={currentLang === lang ? 'default' : 'outline'}
        size="sm"
        className="whitespace-nowrap"
      >
        {lang.toUpperCase()}
      </Button>
    ))}
  </div>
</div>

// Full width textarea
<Textarea
  className="w-full min-h-[200px] text-sm md:text-base"
  value={content[currentLang]}
  onChange={handleChange}
/>
```

**Layout:**
- Mobile: Tabs scrollable, textarea full width
- Tablet/Desktop: Tabs inline, textarea full width

## Touch Optimization

### Button Sizes

```typescript
const buttonSizes = {
  sm: 'h-9 px-3',      // 36px height (mobile minimum)
  default: 'h-10 px-4', // 40px height
  lg: 'h-11 px-6'      // 44px height (recommended)
}
```

### Touch Targets

```tsx
// Minimum 44x44px for all interactive elements
<button className="min-h-[44px] min-w-[44px] flex items-center justify-center">
  <Icon />
</button>

// Checkbox/Radio with larger hit area
<label className="flex items-center gap-3 p-3 cursor-pointer">
  <input type="checkbox" className="w-5 h-5" />
  <span>Label</span>
</label>
```

### Spacing for Touch

```tsx
// Minimum 8px gap between touch targets
<div className="flex gap-2">
  <Button>Action 1</Button>
  <Button>Action 2</Button>
</div>
```

## Responsive Patterns

### Pattern 1: Collapsible Sections (Mobile)

```tsx
const [isOpen, setIsOpen] = useState(false)

<div className="lg:block">
  {/* Desktop: Always visible */}
  <div className="hidden lg:block">
    <FilterContent />
  </div>
  
  {/* Mobile: Collapsible */}
  <div className="lg:hidden">
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="w-full flex items-center justify-between p-4 border rounded"
    >
      <span>Filteri</span>
      <ChevronDown className={isOpen ? 'rotate-180' : ''} />
    </button>
    {isOpen && <FilterContent />}
  </div>
</div>
```

### Pattern 2: Horizontal Scroll with Indicators

```tsx
<div className="relative">
  {/* Scroll container */}
  <div className="overflow-x-auto scrollbar-hide">
    <div className="inline-flex gap-2 min-w-full">
      {items.map(item => (
        <Card key={item.id} className="min-w-[280px]">
          {/* Content */}
        </Card>
      ))}
    </div>
  </div>
  
  {/* Scroll indicators */}
  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
    {items.map((_, i) => (
      <div key={i} className="w-2 h-2 rounded-full bg-gray-300" />
    ))}
  </div>
</div>
```

### Pattern 3: Responsive Images

```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
  {images.map((img, i) => (
    <div key={i} className="relative aspect-video rounded-lg overflow-hidden">
      <img
        src={img}
        alt={`Image ${i + 1}`}
        className="w-full h-full object-cover"
      />
    </div>
  ))}
</div>
```

### Pattern 4: Adaptive Navigation

```tsx
// Mobile: Bottom sheet
<div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4">
  <div className="flex justify-around">
    <Button variant="ghost" size="sm">Dashboard</Button>
    <Button variant="ghost" size="sm">Bookings</Button>
    <Button variant="ghost" size="sm">Settings</Button>
  </div>
</div>

// Desktop: Sidebar
<div className="hidden lg:block w-64 border-r">
  <nav className="p-4 space-y-2">
    <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
    <Button variant="ghost" className="w-full justify-start">Bookings</Button>
    <Button variant="ghost" className="w-full justify-start">Settings</Button>
  </nav>
</div>
```

## CSS Utilities

### Custom Tailwind Classes

```css
/* Hide scrollbar but keep functionality */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Smooth scroll */
.scroll-smooth {
  scroll-behavior: smooth;
}

/* Touch-friendly tap highlight */
.tap-highlight-none {
  -webkit-tap-highlight-color: transparent;
}
```

## Performance Considerations

### Lazy Loading

```tsx
// Lazy load heavy components on mobile
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Skeleton className="h-64" />,
  ssr: false
})

// Only load on desktop
{isDesktop && <HeavyChart />}
```

### Conditional Rendering

```tsx
// Use CSS classes instead of conditional rendering when possible
<div className="hidden lg:block">Desktop content</div>
<div className="lg:hidden">Mobile content</div>

// Better than:
{isDesktop ? <DesktopContent /> : <MobileContent />}
```

## Testing Strategy

### Responsive Testing Checklist

```typescript
const testDevices = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 14', width: 390, height: 844 },
  { name: 'Samsung Galaxy S21', width: 360, height: 800 },
  { name: 'iPad Mini', width: 768, height: 1024 },
  { name: 'iPad Pro', width: 1024, height: 1366 },
  { name: 'Laptop', width: 1440, height: 900 },
  { name: 'Desktop', width: 1920, height: 1080 }
]
```

### Test Cases

1. **No Horizontal Scroll**
   - Open admin panel
   - Resize to 320px width
   - Scroll vertically through all sections
   - Verify no horizontal scrollbar appears

2. **Touch Targets**
   - Open on mobile device
   - Try tapping all buttons
   - Verify minimum 44x44px hit area

3. **Font Readability**
   - Check all text sizes on mobile
   - Verify text is readable without zooming
   - Confirm no text is too large

4. **Form Usability**
   - Fill out apartment form on mobile
   - Verify all inputs are accessible
   - Check keyboard doesn't cover inputs

5. **Table/List Responsiveness**
   - Open booking list on mobile
   - Verify card layout is used
   - Check all info is visible

## Implementation Priority

### Phase 1: Critical Fixes (P0)
1. Fix horizontal scroll issues
2. Adjust font sizes
3. Make tabs scrollable
4. Fix form layouts

### Phase 2: Touch Optimization (P1)
1. Increase touch targets
2. Add proper spacing
3. Optimize button sizes
4. Fix table → card conversion

### Phase 3: Polish (P2)
1. Add smooth transitions
2. Optimize images
3. Add loading states
4. Performance optimization

## Success Metrics

- ✅ Zero horizontal scroll on all breakpoints
- ✅ All touch targets ≥ 44x44px
- ✅ Font sizes professional (14-16px body text)
- ✅ Forms usable on 375px width
- ✅ No layout breaks between breakpoints
- ✅ Lighthouse mobile score ≥ 90
- ✅ No CLS (Cumulative Layout Shift)
