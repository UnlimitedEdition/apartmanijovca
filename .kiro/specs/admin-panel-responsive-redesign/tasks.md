# Admin Panel Responsive Redesign - Tasks

## Overview
Implementacija responsive dizajna za admin panel sa fokusom na eliminaciju horizontal scrolla i profesionalne veličine teksta.

---

## Task 1: Setup Responsive Utilities
**Priority:** P0  
**Estimate:** 30 min

### Description
Kreirati helper utilities i custom Tailwind classes za responsive design.

### Subtasks
1. Dodati custom Tailwind utilities u `tailwind.config.js`
2. Kreirati responsive breakpoint hooks
3. Dodati CSS utilities za scroll behavior

### Files to Modify
- `tailwind.config.js`
- `src/hooks/useBreakpoint.ts` (new)
- `src/styles/globals.css`

### Acceptance Criteria
- ✅ Custom utilities dostupni u Tailwind
- ✅ useBreakpoint hook radi
- ✅ Scrollbar utilities primenjeni

---

## Task 2: Fix AdminDashboard Responsive Layout
**Priority:** P0  
**Estimate:** 1 hour

### Description
Popraviti AdminDashboard da radi na svim ekranima bez horizontal scrolla.

### Subtasks
1. Napraviti tabs scrollable na mobile
2. Popraviti stats grid (1/2/4 kolone)
3. Optimizovati font sizes
4. Dodati responsive padding

### Files to Modify
- `src/app/admin/AdminDashboard.tsx`

### Changes
```tsx
// Before
<TabsList className="grid w-full grid-cols-5">

// After
<div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
  <TabsList className="inline-flex min-w-full md:grid md:grid-cols-5 w-full">
    <TabsTrigger value="dashboard" className="text-sm md:text-base whitespace-nowrap">
```

### Acceptance Criteria
- ✅ Tabs scrollable na mobile
- ✅ Stats cards 1 kolona (mobile), 2 (tablet), 4 (desktop)
- ✅ No horizontal scroll na 320px
- ✅ Font sizes profesionalni

---

## Task 3: Fix EnhancedApartmentManager Responsive
**Priority:** P0  
**Estimate:** 2 hours

### Description
Optimizovati EnhancedApartmentManager za sve ekrane.

### Subtasks
1. Napraviti 5 tabs scrollable na mobile
2. Popraviti form grid (1/2 kolone)
3. Popraviti checkbox grid (1/2/3 kolone)
4. Optimizovati image gallery grid
5. Popraviti font sizes

### Files to Modify
- `src/components/admin/EnhancedApartmentManager.tsx`

### Changes
```tsx
// Tabs
<div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 mb-6">
  <TabsList className="inline-flex min-w-full md:grid md:grid-cols-5">
    <TabsTrigger value="basic" className="text-sm md:text-base whitespace-nowrap px-4 md:px-6">

// Form grid
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

// Checkbox grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">

// Image gallery
<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
```

### Acceptance Criteria
- ✅ 5 tabs vidljivi i scrollable na mobile
- ✅ Forms 1 kolona (mobile), 2 (tablet+)
- ✅ Checkboxes 1/2/3 kolone
- ✅ Images 2/4 kolone
- ✅ No horizontal scroll

---

## Task 4: Convert BookingList to Responsive Cards
**Priority:** P0  
**Estimate:** 1.5 hours

### Description
Konvertovati BookingList table u card layout za mobile/tablet.

### Subtasks
1. Kreirati card component za booking
2. Implementirati conditional rendering (table vs cards)
3. Optimizovati touch targets
4. Dodati responsive filters

### Files to Modify
- `src/components/admin/BookingList.tsx`

### Implementation
```tsx
// Desktop: Table
<div className="hidden lg:block overflow-x-auto">
  <table className="w-full">
    {/* Existing table */}
  </table>
</div>

// Mobile/Tablet: Cards
<div className="lg:hidden space-y-4">
  {bookings.map(booking => (
    <Card key={booking.id} className="p-4">
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-base">{booking.guestName}</h3>
            <p className="text-sm text-gray-600">{booking.apartmentName}</p>
          </div>
          <Badge className="text-xs">{booking.status}</Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">Check-in:</span>
            <span className="ml-2 font-medium">{formatDate(booking.checkIn)}</span>
          </div>
          <div>
            <span className="text-gray-600">Check-out:</span>
            <span className="ml-2 font-medium">{formatDate(booking.checkOut)}</span>
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button size="sm" className="flex-1 h-10">Detalji</Button>
          <Button size="sm" variant="outline" className="flex-1 h-10">Izmeni</Button>
        </div>
      </div>
    </Card>
  ))}
</div>
```

### Acceptance Criteria
- ✅ Table na desktop (lg+)
- ✅ Cards na mobile/tablet
- ✅ Svi podaci vidljivi u card layout
- ✅ Touch targets ≥ 44px
- ✅ Filters collapsible na mobile

---

## Task 5: Fix StatsCards Responsive Grid
**Priority:** P0  
**Estimate:** 30 min

### Description
Optimizovati StatsCards grid za sve ekrane.

### Subtasks
1. Implementirati 1/2/4 kolona grid
2. Optimizovati card padding
3. Popraviti font sizes
4. Dodati responsive icons

### Files to Modify
- `src/components/admin/StatsCards.tsx`

### Changes
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {stats.map(stat => (
    <Card key={stat.id} className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
          <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
          {stat.change && (
            <p className="text-xs md:text-sm text-gray-500 mt-1">{stat.change}</p>
          )}
        </div>
        <div className="text-blue-600 ml-4">
          <stat.icon className="w-8 h-8 md:w-10 md:h-10" />
        </div>
      </div>
    </Card>
  ))}
</div>
```

### Acceptance Criteria
- ✅ 1 kolona na mobile
- ✅ 2 kolone na tablet
- ✅ 4 kolone na desktop
- ✅ Font sizes profesionalni
- ✅ Icons responsive

---

## Task 6: Fix ContentEditor Responsive
**Priority:** P1  
**Estimate:** 45 min

### Description
Optimizovati ContentEditor za mobile uređaje.

### Subtasks
1. Napraviti language tabs scrollable
2. Optimizovati textarea width
3. Popraviti font sizes
4. Dodati responsive padding

### Files to Modify
- `src/components/admin/ContentEditor.tsx`

### Changes
```tsx
// Language tabs
<div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 mb-4">
  <div className="inline-flex gap-2 min-w-full md:w-auto">
    {languages.map(lang => (
      <Button
        key={lang}
        variant={currentLang === lang ? 'default' : 'outline'}
        size="sm"
        className="whitespace-nowrap min-w-[60px] h-10"
        onClick={() => setCurrentLang(lang)}
      >
        {lang.toUpperCase()}
      </Button>
    ))}
  </div>
</div>

// Textarea
<Textarea
  className="w-full min-h-[200px] text-sm md:text-base"
  value={content[currentLang]}
  onChange={handleChange}
/>
```

### Acceptance Criteria
- ✅ Language tabs scrollable na mobile
- ✅ Textarea full width
- ✅ Font size readable
- ✅ No horizontal scroll

---

## Task 7: Fix AvailabilityManager Responsive
**Priority:** P1  
**Estimate:** 1 hour

### Description
Optimizovati AvailabilityManager calendar za mobile.

### Subtasks
1. Napraviti calendar scrollable horizontalno
2. Optimizovati date picker za touch
3. Popraviti form layout
4. Dodati responsive legend

### Files to Modify
- `src/components/admin/AvailabilityManager.tsx`

### Acceptance Criteria
- ✅ Calendar scrollable na mobile
- ✅ Date picker touch-friendly
- ✅ Forms 1 kolona na mobile
- ✅ Legend readable

---

## Task 8: Fix AnalyticsView Responsive
**Priority:** P1  
**Estimate:** 1 hour

### Description
Optimizovati AnalyticsView charts za mobile.

### Subtasks
1. Napraviti charts responsive
2. Optimizovati chart height za mobile
3. Popraviti legend position
4. Dodati horizontal scroll za wide charts

### Files to Modify
- `src/components/admin/AnalyticsView.tsx`

### Changes
```tsx
// Responsive chart container
<div className="w-full overflow-x-auto">
  <div className="min-w-[300px] md:min-w-0">
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        {/* Chart content */}
      </LineChart>
    </ResponsiveContainer>
  </div>
</div>
```

### Acceptance Criteria
- ✅ Charts responsive
- ✅ Readable na mobile
- ✅ No overflow issues
- ✅ Legend positioned correctly

---

## Task 9: Optimize Touch Targets
**Priority:** P1  
**Estimate:** 1 hour

### Description
Obezbediti da svi interactive elementi imaju minimum 44x44px touch target.

### Subtasks
1. Audit svih buttons
2. Povećati button heights
3. Dodati padding oko checkboxes/radios
4. Optimizovati icon buttons

### Files to Modify
- All admin components

### Changes
```tsx
// Button sizes
<Button size="sm" className="h-10 px-4">  // 40px height
<Button size="default" className="h-11 px-6">  // 44px height

// Checkbox/Radio
<label className="flex items-center gap-3 p-3 cursor-pointer min-h-[44px]">
  <input type="checkbox" className="w-5 h-5" />
  <span className="text-sm md:text-base">Label</span>
</label>

// Icon buttons
<button className="min-h-[44px] min-w-[44px] flex items-center justify-center">
  <Icon className="w-5 h-5" />
</button>
```

### Acceptance Criteria
- ✅ All buttons ≥ 40px height
- ✅ Interactive elements ≥ 44x44px
- ✅ Proper spacing between targets
- ✅ Easy to tap on mobile

---

## Task 10: Add Responsive Container Padding
**Priority:** P1  
**Estimate:** 30 min

### Description
Dodati consistent responsive padding kroz ceo admin panel.

### Subtasks
1. Audit svih containers
2. Primeniti responsive padding
3. Popraviti negative margins
4. Optimizovati max-width

### Files to Modify
- All admin components

### Changes
```tsx
// Container padding
<div className="px-4 md:px-6 lg:px-8 py-4 md:py-6">

// Max width
<div className="max-w-7xl mx-auto">

// Negative margin for full-bleed
<div className="-mx-4 px-4 md:mx-0 md:px-0">
```

### Acceptance Criteria
- ✅ Consistent padding na svim ekranima
- ✅ 16px (mobile), 24px (tablet), 32px (desktop)
- ✅ Max width 1920px
- ✅ Proper negative margins

---

## Task 11: Testing & QA
**Priority:** P0  
**Estimate:** 2 hours

### Description
Testirati responsive design na svim target uređajima.

### Test Devices
- iPhone SE (375px)
- iPhone 14 (390px)
- Samsung Galaxy S21 (360px)
- iPad Mini (768px)
- iPad Pro (1024px)
- Laptop (1440px)
- Desktop (1920px)

### Test Cases
1. No horizontal scroll na svim ekranima
2. Svi elementi vidljivi i funkcionalni
3. Touch targets ≥ 44px
4. Font sizes readable
5. Forms usable
6. Tables/lists readable
7. Images ne overflow
8. Tabs scrollable gde treba

### Acceptance Criteria
- ✅ Zero horizontal scroll (320px - 2560px)
- ✅ All tests pass na svim uređajima
- ✅ No layout breaks
- ✅ Smooth experience

---

## Task 12: Performance Optimization
**Priority:** P2  
**Estimate:** 1 hour

### Description
Optimizovati performance responsive layouta.

### Subtasks
1. Lazy load heavy components na mobile
2. Optimizovati images
3. Dodati loading states
4. Minimize layout shifts

### Files to Modify
- All admin components

### Acceptance Criteria
- ✅ Lighthouse mobile score ≥ 90
- ✅ CLS = 0
- ✅ Fast load times
- ✅ Smooth transitions

---

## Implementation Order

### Phase 1: Critical Fixes (Day 1)
1. Task 1: Setup utilities
2. Task 2: AdminDashboard
3. Task 3: EnhancedApartmentManager
4. Task 4: BookingList
5. Task 5: StatsCards

### Phase 2: Remaining Components (Day 2)
6. Task 6: ContentEditor
7. Task 7: AvailabilityManager
8. Task 8: AnalyticsView
9. Task 9: Touch targets
10. Task 10: Container padding

### Phase 3: Testing & Polish (Day 3)
11. Task 11: Testing & QA
12. Task 12: Performance optimization

---

## Estimated Total Time
- Phase 1: 5.5 hours
- Phase 2: 4.5 hours
- Phase 3: 3 hours
- **Total: 13 hours (2-3 days)**

---

## Success Criteria

✅ Zero horizontal scroll na svim ekranima (320px - 2560px+)
✅ Svi elementi vidljivi i funkcionalni na mobile
✅ Touch targets minimum 44x44px
✅ Font sizes profesionalni (14-16px body)
✅ Smooth experience na svim uređajima
✅ No layout breaks između breakpoints
✅ Forms funkcionalni na mobile
✅ Tables/lists čitljivi (card layout na mobile)
✅ Tabs scrollable gde je potrebno
✅ Images responsive (ne prelaze container)
✅ Lighthouse mobile score ≥ 90
✅ Zero CLS (Cumulative Layout Shift)
