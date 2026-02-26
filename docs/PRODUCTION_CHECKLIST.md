# Production Deployment Checklist

Use this checklist to ensure a successful production deployment of the Apartmani Jovca application.

---

## Pre-Deployment Checklist

### Code & Configuration

- [ ] **All tests pass**
  ```bash
  npm test
  ```

- [ ] **Build succeeds locally**
  ```bash
  npm run build
  ```

- [ ] **No TypeScript errors**
  ```bash
  npx tsc --noEmit
  ```

- [ ] **No ESLint errors**
  ```bash
  npm run lint
  ```

- [ ] **Environment variables configured**
  - [ ] `NEXT_PUBLIC_SUPABASE_URL` set
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` set
  - [ ] `RESEND_API_KEY` set
  - [ ] `NEXT_PUBLIC_SITE_URL` set

### Database

- [ ] **Supabase project active** (not paused)
- [ ] **Database migrations applied**
- [ ] **Row Level Security policies configured**
- [ ] **Tables populated with content**
- [ ] **Indexes created for performance**

### External Services

- [ ] **Resend account configured**
  - [ ] API key generated
  - [ ] Domain verified (optional but recommended)
  - [ ] "From" email configured

- [ ] **WhatsApp (if enabled)**
  - [ ] API credentials valid
  - [ ] Phone number verified

---

## Post-Deployment Verification

### Functional Testing

#### Homepage & Navigation
- [ ] Homepage loads without errors
- [ ] All languages accessible (en, sr, de, it)
- [ ] Language switcher works
- [ ] Navigation links functional
- [ ] Footer content displays correctly

#### Booking System
- [ ] Availability calendar loads
- [ ] Date selection works
- [ ] Booking form submits successfully
- [ ] Confirmation email sent
- [ ] Booking appears in admin panel

#### Authentication
- [ ] Admin login works
  - [ ] Access to /admin route
  - [ ] Can view all bookings
  - [ ] Can manage apartments
  - [ ] Can edit content
- [ ] Guest portal login works
  - [ ] Guests can view their bookings
  - [ ] Profile settings accessible

#### API Routes
- [ ] `/api/availability` returns correct data
- [ ] `/api/booking` accepts submissions
- [ ] `/api/email` sends notifications
- [ ] `/api/whatsapp` sends messages (if enabled)

### Performance

- [ ] **Lighthouse Score ≥ 90 (Performance)**
- [ ] **Lighthouse Score ≥ 90 (Accessibility)**
- [ ] **Lighthouse Score ≥ 90 (Best Practices)**
- [ ] **Lighthouse Score ≥ 90 (SEO)**

- [ ] **First Contentful Paint < 1.5s**
- [ ] **Largest Contentful Paint < 2.5s**
- [ ] **Time to Interactive < 3.5s**
- [ ] **Cumulative Layout Shift < 0.1**

### Mobile Responsiveness

- [ ] **Mobile (375px)** - Layout correct, no horizontal scroll
- [ ] **Tablet (768px)** - All features accessible
- [ ] **Desktop (1440px)** - Optimal layout display

---

## Security Checklist

### Application Security
- [ ] **No sensitive data in client-side code**
- [ ] **Environment variables not exposed**
- [ ] **API routes properly protected**
- [ ] **Authentication working correctly**
- [ ] **Authorization checks in place**

### Supabase Security
- [ ] **Anon key is safe to expose** (checked in client)
- [ ] **Service role key never exposed to client**
- [ ] **RLS policies enabled on all tables**
- [ ] **RLS policies tested**

### Security Headers

Verify these headers are set in `vercel.json`:

- [ ] `Strict-Transport-Security` (HSTS)
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY`
- [ ] `X-XSS-Protection: 1; mode=block`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Permissions-Policy` (camera, microphone, etc.)

### Data Protection
- [ ] **No PII in logs**
- [ ] **No credentials in code**
- [ ] **Secure password storage** (handled by Supabase)
- [ ] **Secure session handling**

---

## Monitoring & Analytics

### Analytics Setup
- [ ] **Google Analytics (if configured)**
  - [ ] Tracking ID added
  - [ ] Page views tracked
  - [ ] Events configured

- [ ] **Custom Analytics**
  - [ ] Analytics API functional
  - [ ] Data collecting properly

### Error Tracking
- [ ] **Vercel error monitoring active**
- [ ] **Function logs accessible**
- [ ] **No critical errors in logs**

### Uptime
- [ ] **Health check endpoint working** (optional)
- [ ] **Monitoring alerts configured** (optional)

---

## SEO Checklist

### On-Page SEO
- [ ] **Meta titles configured**
- [ ] **Meta descriptions present**
- [ ] **Open Graph tags set**
- [ ] **Twitter cards configured**
- [ ] **Canonical URLs set**

### Technical SEO
- [ ] **Sitemap.xml accessible** (/sitemap.xml)
- [ ] **Robots.txt configured** (/robots.txt)
- [ ] **Structured data (JSON-LD) present**
- [ ] **Semantic HTML used**

### Performance SEO
- [ ] **Images optimized**
- [ ] **Fonts preloaded**
- [ ] **Critical CSS inlined**
- [ ] **Lazy loading implemented**

---

## Backup & Recovery

### Backup Verification
- [ ] **Database backups configured**
- [ ] **Application code in version control**
- [ ] **Environment configuration documented**

### Recovery Plan
- [ ] **Rollback process documented**
- [ ] **Database restore tested**
- [ ] **Deployment rollback verified**

---

## Go-Live Checklist

### Final Verification
- [ ] **All above items checked**
- [ ] **Stakeholders informed**
- [ ] **Monitoring active**
- [ ] **Support contacts ready**

### Domain & SSL
- [ ] **Custom domain pointing to Vercel**
- [ ] **SSL certificate active**
- [ ] **HTTPS enforced**
- [ ] **WWW/non-WWW redirect configured**

### Launch
- [ ] **DNS propagated**
- [ ] **Final functional test passed**
- [ ] **Performance targets met**
- [ ] **Deployment complete!**

---

## Post-Launch Monitoring (First 24 Hours)

- [ ] Monitor error rates
- [ ] Check function execution times
- [ ] Verify bookings are processing
- [ ] Confirm emails are sending
- [ ] Test from multiple locations

---

## Rollback Procedure

If issues occur:

1. **Vercel Dashboard:**
   - Go to Deployments
   - Find last working deployment
   - Click "Promote to Production"

2. **Git Revert:**
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Database (if needed):**
   - Restore from Supabase backup
   - Re-run migrations if needed

---

*Checklist version: 1.0*
*Last updated: 2026-02-14*
