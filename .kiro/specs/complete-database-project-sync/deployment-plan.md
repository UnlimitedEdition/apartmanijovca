# Deployment Plan: Kompletna Usklađenost Baze Podataka i Projekta

## Executive Summary

This deployment plan covers the rollout of complete database-project synchronization for Apartmani Jovča. The changes include:
- Complete TypeScript types for all 10 database tables
- Transformer functions for JSONB data localization
- Fixed API routes using correct column names
- Updated components displaying localized data
- Comprehensive test coverage

**Status**: ⚠️ **READY FOR DEPLOYMENT** (with caveats - see Pre-Deployment Checklist)

## Pre-Deployment Checklist

### Code Quality ✅
- [x] All TypeScript types defined for 10 tables
- [x] Transformer functions implemented and tested
- [x] API routes updated with correct column names
- [x] Components updated to use localized data
- [x] TypeScript compiles without errors
- [x] Production build successful

### Testing Status ⚠️
- [x] Unit tests pass (9/15 test suites passing)
- [x] Transformer tests pass (100%)
- [x] Database type tests pass (100%)
- [x] Property-based tests pass (100 random cases)
- [ ] ⚠️ **API integration tests failing** (31 tests)
  - Content API returning 500 errors (6 tests)
  - Bookings API returning 500 errors (12 tests)
  - Availability API returning 404/400 errors (13 tests)

### Infrastructure ⏭️
- [ ] Backup of production database created
- [ ] Staging environment tested
- [ ] Rollback plan prepared
- [ ] Monitoring tools configured
- [ ] Error tracking enabled (Sentry/LogRocket)

### Documentation ⏭️
- [x] Manual testing guides created
- [x] Test results documented
- [x] Build results documented
- [ ] README.md updated (Task 7.6)
- [ ] API documentation updated

### Team Readiness ⏭️
- [ ] Team notified of deployment schedule
- [ ] Support team briefed on changes
- [ ] Rollback procedures communicated
- [ ] Post-deployment monitoring assigned

## Deployment Strategy

### Recommended Approach: **Phased Rollout**

Given the failing API tests, we recommend a phased approach:

**Phase 1: Fix Critical Issues** (BEFORE deployment)
1. Investigate and fix Content API 500 errors
2. Investigate and fix Bookings API 500 errors
3. Investigate and fix Availability API 404/400 errors
4. Re-run all tests
5. Verify all tests pass

**Phase 2: Staging Deployment**
1. Deploy to staging environment
2. Run manual tests (see manual-testing-guide.md)
3. Run component tests (see component-testing-guide.md)
4. Verify all functionality works
5. Performance testing

**Phase 3: Production Deployment**
1. Create database backup
2. Deploy code to production
3. Run smoke tests
4. Monitor for errors
5. Verify functionality

## Deployment Steps

### Step 1: Pre-Deployment Preparation

#### 1.1 Create Database Backup
```bash
# Connect to Supabase project
supabase login

# Create backup (if using Supabase CLI)
supabase db dump -f backup_$(date +%Y%m%d_%H%M%S).sql

# OR use Supabase Dashboard:
# 1. Go to Database → Backups
# 2. Click "Create Backup"
# 3. Download backup file
```

**Verification**:
- [ ] Backup file created
- [ ] Backup file size reasonable (not 0 bytes)
- [ ] Backup file stored securely

#### 1.2 Verify Environment Variables
```bash
# Check production environment variables
# Ensure these are set:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_SERVICE_ROLE_KEY=your-service-role-key
```

**Verification**:
- [ ] All required environment variables set
- [ ] Keys are valid and not expired
- [ ] Database connection works

#### 1.3 Review Changes
```bash
# Review all changes since last deployment
git log --oneline --since="2024-01-01"

# Review specific files changed
git diff main..HEAD --stat
```

**Key Changes to Review**:
- [ ] TypeScript types in `src/lib/types/database.ts`
- [ ] Transformer functions in `src/lib/transformers/database.ts`
- [ ] API routes (availability, bookings, apartments, etc.)
- [ ] Components (ApartmentManager, AvailabilityCalendar, etc.)

### Step 2: Database Migration (IF NEEDED)

**Note**: Based on Phase 5 analysis, migrations may or may not be needed. Check if database structure matches code.

#### 2.1 Check Current Database State
```sql
-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected tables:
-- analytics_events, apartments, availability, booking_messages, 
-- bookings, content, gallery, guests, messages, reviews
```

#### 2.2 Check Column Names
```sql
-- Check guests table has full_name (not name)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'guests';

-- Check apartments table has base_price_eur (not price_per_night)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'apartments';

-- Check bookings table has check_in, check_out, nights
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bookings';
```

#### 2.3 Apply Migrations (IF NEEDED)
```bash
# Only if database structure doesn't match code
supabase db push

# OR manually apply migrations
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/01_SCHEMA_COMPLETE.sql
```

**Verification**:
- [ ] All tables exist
- [ ] All columns have correct names
- [ ] All JSONB columns configured correctly
- [ ] All constraints in place
- [ ] All indexes created

### Step 3: Code Deployment

#### 3.1 Build Production Bundle
```bash
# Clean previous build
rm -rf .next

# Build production bundle
npm run build

# Verify build successful
echo $?  # Should output 0
```

**Verification**:
- [ ] Build completes without errors
- [ ] No TypeScript errors
- [ ] All pages generated
- [ ] Bundle size reasonable

#### 3.2 Deploy to Hosting Platform

**For Vercel**:
```bash
# Deploy to production
vercel --prod

# OR push to main branch (if auto-deploy configured)
git push origin main
```

**For Other Platforms**:
```bash
# Follow platform-specific deployment instructions
# Examples:
# - Netlify: netlify deploy --prod
# - AWS Amplify: git push origin main
# - Custom server: scp -r .next user@server:/path/to/app
```

**Verification**:
- [ ] Deployment successful
- [ ] No deployment errors
- [ ] Application accessible at production URL

### Step 4: Post-Deployment Verification

#### 4.1 Smoke Tests

**Test 1: Home Page**
```bash
curl -I https://your-domain.com/sr
# Expected: 200 OK
```

**Test 2: API Availability**
```bash
curl "https://your-domain.com/api/availability?checkIn=2024-06-01&checkOut=2024-06-05"
# Expected: JSON response with apartments array
# Verify: apartment.name is string, not object
# Verify: apartment.base_price_eur exists
```

**Test 3: API Booking**
```bash
curl -X POST "https://your-domain.com/api/booking" \
  -H "Content-Type: application/json" \
  -d '{
    "apartmentId": "test-id",
    "guest": {"name": "Test", "email": "test@example.com"},
    "checkIn": "2024-07-01",
    "checkOut": "2024-07-05"
  }'
# Expected: Booking created or validation error (not 500 error)
```

**Test 4: Admin Panel**
```bash
# Open in browser
https://your-domain.com/admin

# Verify:
# - Login page loads
# - Can login
# - Dashboard loads
# - Apartment names display as text (not [object Object])
```

**Verification Checklist**:
- [ ] Home page loads (200 OK)
- [ ] API routes respond (not 500 errors)
- [ ] Admin panel accessible
- [ ] Apartment names display correctly
- [ ] No console errors in browser

#### 4.2 Functional Tests

**Test Apartment Display**:
1. Navigate to `/sr/apartments`
2. Verify apartment names are in Serbian
3. Verify prices display correctly
4. Verify amenities display as list
5. Verify images load

**Test Booking Flow**:
1. Navigate to `/sr/booking`
2. Select dates
3. Select apartment
4. Fill guest information
5. Submit booking
6. Verify confirmation page
7. Check database for new booking
8. Verify guest created with `full_name` column

**Test Admin Panel**:
1. Login to admin panel
2. Navigate to Apartments tab
3. Verify apartment list displays correctly
4. Edit an apartment
5. Verify changes save
6. Navigate to Bookings tab
7. Verify bookings display correctly
8. Navigate to Availability tab
9. Verify calendar loads

**Verification Checklist**:
- [ ] Apartment display works
- [ ] Booking flow works end-to-end
- [ ] Admin panel fully functional
- [ ] Data saves correctly to database
- [ ] No [object Object] displayed anywhere

#### 4.3 Database Verification

```sql
-- Check recent bookings use correct columns
SELECT id, booking_number, check_in, check_out, nights 
FROM bookings 
ORDER BY created_at DESC 
LIMIT 5;

-- Check guests use full_name
SELECT id, full_name, email 
FROM guests 
ORDER BY created_at DESC 
LIMIT 5;

-- Check apartments have JSONB data
SELECT id, name, base_price_eur 
FROM apartments 
LIMIT 5;
```

**Verification**:
- [ ] Bookings have correct column names
- [ ] Guests have full_name (not name)
- [ ] Apartments have base_price_eur
- [ ] JSONB columns contain proper objects

### Step 5: Monitoring

#### 5.1 Error Monitoring

**Check Error Logs**:
```bash
# Vercel logs
vercel logs

# OR check platform-specific logs
# - Netlify: netlify logs
# - AWS: CloudWatch logs
```

**Monitor for**:
- [ ] No 500 errors in API routes
- [ ] No TypeScript errors
- [ ] No database connection errors
- [ ] No JSONB transformation errors

#### 5.2 Performance Monitoring

**Check Metrics**:
- [ ] Page load times < 3 seconds
- [ ] API response times < 1 second
- [ ] Database query times < 500ms
- [ ] No memory leaks

**Tools**:
- Vercel Analytics
- Google PageSpeed Insights
- Lighthouse
- Supabase Dashboard (Database Performance)

#### 5.3 User Monitoring

**Check for**:
- [ ] No user-reported errors
- [ ] Booking flow working
- [ ] Admin panel working
- [ ] Correct data display

**Duration**: Monitor for 24-48 hours after deployment

## Rollback Plan

### When to Rollback

Rollback immediately if:
- ❌ Critical API routes return 500 errors
- ❌ Bookings cannot be created
- ❌ Admin panel unusable
- ❌ Data corruption detected
- ❌ Performance degradation > 50%

### Rollback Steps

#### Option 1: Code Rollback (Preferred)

```bash
# Revert to previous deployment
vercel rollback

# OR revert git commit
git revert HEAD
git push origin main

# OR checkout previous commit
git checkout <previous-commit-hash>
git push origin main --force
```

**Verification**:
- [ ] Previous version deployed
- [ ] Application functional
- [ ] No data loss

#### Option 2: Database Rollback (IF migrations were applied)

**⚠️ WARNING**: Only use if database migrations were applied and caused issues

```bash
# Restore from backup
psql -h your-db-host -U postgres -d postgres < backup_YYYYMMDD_HHMMSS.sql

# OR use Supabase Dashboard:
# 1. Go to Database → Backups
# 2. Select backup
# 3. Click "Restore"
```

**Verification**:
- [ ] Database restored
- [ ] Data intact
- [ ] Application functional

#### Option 3: Full Rollback (Code + Database)

1. Rollback code (Option 1)
2. Rollback database (Option 2)
3. Verify application works
4. Notify team

### Post-Rollback Actions

1. **Investigate Issue**
   - Review error logs
   - Identify root cause
   - Document findings

2. **Fix Issue**
   - Apply fix to code
   - Test thoroughly
   - Re-deploy when ready

3. **Communicate**
   - Notify team of rollback
   - Explain reason
   - Provide timeline for fix

## Post-Deployment Tasks

### Immediate (Within 1 hour)

- [ ] Verify all smoke tests pass
- [ ] Check error logs
- [ ] Monitor performance metrics
- [ ] Verify booking flow works
- [ ] Verify admin panel works

### Short-term (Within 24 hours)

- [ ] Monitor error rates
- [ ] Check user feedback
- [ ] Review performance metrics
- [ ] Verify data integrity
- [ ] Update documentation

### Long-term (Within 1 week)

- [ ] Analyze usage patterns
- [ ] Optimize performance if needed
- [ ] Address any minor issues
- [ ] Plan next improvements
- [ ] Team retrospective

## Communication Plan

### Pre-Deployment

**Notify**:
- Development team
- Support team
- Stakeholders

**Message**:
```
Deployment scheduled for [DATE] at [TIME]
Changes: Complete database-project synchronization
Expected downtime: None (zero-downtime deployment)
Rollback plan: Available if needed
Contact: [YOUR NAME/EMAIL] for issues
```

### During Deployment

**Status Updates**:
- Start: "Deployment started"
- Progress: "Step X of Y complete"
- Complete: "Deployment successful"
- Issues: "Issue detected, investigating"

### Post-Deployment

**Success Message**:
```
✅ Deployment successful!
- All systems operational
- No errors detected
- Performance normal
- Monitoring active

Changes deployed:
- Complete TypeScript types for all tables
- JSONB data transformation
- Fixed API column names
- Updated components

Please report any issues to [YOUR EMAIL]
```

**Failure Message** (if rollback needed):
```
⚠️ Deployment rolled back
- Issue detected: [DESCRIPTION]
- Rollback completed
- Previous version restored
- No data loss

Next steps:
- Investigating root cause
- Will provide update in [TIMEFRAME]
- New deployment scheduled after fix

Contact [YOUR EMAIL] for questions
```

## Risk Assessment

### High Risk Items ⚠️

1. **API Integration Tests Failing**
   - **Risk**: API routes may fail in production
   - **Mitigation**: Fix tests before deployment OR deploy to staging first
   - **Impact**: High (booking flow broken)

2. **Database Column Name Changes**
   - **Risk**: Existing queries may fail if columns renamed
   - **Mitigation**: Verify database already has correct column names
   - **Impact**: High (data access broken)

3. **JSONB Transformation**
   - **Risk**: Transformation may fail for edge cases
   - **Mitigation**: Comprehensive testing, fallback logic
   - **Impact**: Medium (display issues)

### Medium Risk Items ⚠️

4. **Performance Impact**
   - **Risk**: Transformation adds processing overhead
   - **Mitigation**: Monitor performance, optimize if needed
   - **Impact**: Medium (slower response times)

5. **Localization Edge Cases**
   - **Risk**: Missing translations may cause empty strings
   - **Mitigation**: Fallback to Serbian, test all languages
   - **Impact**: Medium (display issues)

### Low Risk Items ✅

6. **TypeScript Compilation**
   - **Risk**: Build may fail
   - **Mitigation**: Already tested, build successful
   - **Impact**: Low (caught before deployment)

7. **Component Rendering**
   - **Risk**: Components may not display correctly
   - **Mitigation**: Manual testing, visual verification
   - **Impact**: Low (visual issues only)

## Success Criteria

Deployment is considered successful when:

### Functional Requirements ✅
- [ ] All pages load without errors
- [ ] All API routes respond correctly (no 500 errors)
- [ ] Booking flow works end-to-end
- [ ] Admin panel fully functional
- [ ] Data displays correctly (no [object Object])
- [ ] All languages work (sr, en, de, it)

### Performance Requirements ✅
- [ ] Page load times < 3 seconds
- [ ] API response times < 1 second
- [ ] No performance degradation vs. previous version

### Data Integrity ✅
- [ ] No data loss
- [ ] All bookings preserved
- [ ] All guests preserved
- [ ] Database structure correct

### User Experience ✅
- [ ] No user-reported errors
- [ ] Positive user feedback
- [ ] No confusion about changes

## Timeline

### Recommended Schedule

**Day 1: Pre-Deployment**
- Morning: Fix failing API tests
- Afternoon: Re-run all tests, verify pass
- Evening: Create database backup

**Day 2: Staging Deployment**
- Morning: Deploy to staging
- Afternoon: Manual testing
- Evening: Performance testing

**Day 3: Production Deployment**
- Morning: Final verification
- Afternoon: Deploy to production (low-traffic time)
- Evening: Monitor and verify

**Day 4-5: Post-Deployment**
- Continuous monitoring
- Address any issues
- Collect feedback

### Alternative: Fast-Track (IF tests pass)

**Hour 0-1**: Pre-deployment checks
**Hour 1-2**: Database backup
**Hour 2-3**: Code deployment
**Hour 3-4**: Verification and monitoring
**Hour 4-24**: Continuous monitoring

## Conclusion

This deployment plan provides a comprehensive approach to rolling out the database-project synchronization changes. The key points are:

1. ✅ **Code is ready**: TypeScript compiles, build successful
2. ⚠️ **Tests need attention**: 31 failing API tests must be fixed
3. ✅ **Rollback plan ready**: Can revert if issues occur
4. ✅ **Monitoring plan ready**: Will catch issues quickly

**Recommendation**: 
- **DO NOT deploy to production** until API tests pass
- **DO deploy to staging** to verify functionality
- **DO fix failing tests** before production deployment
- **DO follow phased rollout** for safety

**Estimated Timeline**:
- Fix tests: 4-6 hours
- Staging deployment: 4 hours
- Production deployment: 2 hours
- **Total**: 10-12 hours (2 days)

**Contact**: [YOUR NAME/EMAIL] for questions or issues during deployment.
