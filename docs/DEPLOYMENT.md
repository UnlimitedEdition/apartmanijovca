# Apartmani Jovca - Vercel Deployment Guide

This document provides comprehensive instructions for deploying the Apartmani Jovca Next.js application to Vercel.

## Prerequisites

Before deploying, ensure you have:
- [ ] Node.js 18+ installed
- [ ] Vercel account (free tier works)
- [ ] Supabase project created
- [ ] Domain name (optional but recommended)
- [ ] GitHub/GitLab/Bitbucket repository

---

## Table of Contents

1. [Environment Setup](#environment-setup)
2. [Supabase Configuration](#supabase-configuration)
3. [Vercel Deployment](#vercel-deployment)
4. [Environment Variables](#environment-variables)
5. [Domain Setup](#domain-setup)
6. [Post-Deployment Verification](#post-deployment-verification)

---

## Environment Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-repo/apartmani-jovca-next.git
cd apartmani-jovca-next

# Install dependencies
npm install
```

### 2. Create Production Environment File

Copy the example file and configure your production variables:

```bash
cp .env.production.example .env.local
```

Then edit `.env.local` with your production values (see Environment Variables section below).

---

## Supabase Configuration

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project: "apartmani-jovca"
3. Note your `Project URL` and `anon public` key

### 2. Configure Database

Run migrations in your Supabase SQL editor:

```sql
-- Run all migration files from docs/DATABASE_MIGRATION.md
```

### 3. Supabase Settings

1. **Authentication → Providers**: Enable Email provider
2. **API Settings**: Ensure `anon` and `service_role` keys are accessible
3. **Row Level Security**: Ensure policies are configured for:
   - `apartments` table (public read, admin write)
   - `bookings` table (authenticated read/write for own bookings, admin full access)
   - `availability` table (public read, admin write)
   - `content` table (admin only)

---

## Environment Variables

### Required Variables

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase Service Role (Server-side only - DO NOT expose to client)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Resend Email (Required for notifications)
RESEND_API_KEY=re_123456789

# WhatsApp (Optional)
WHATSAPP_API_URL=https://api.whatsapp.com
WHATSAPP_PHONE_NUMBER=1234567890
WHATSAPP_API_TOKEN=your-whatsapp-token

# Admin Authentication
ADMIN_EMAIL=admin@apartmanijovca.rs
ADMIN_PASSWORD=your-secure-password-here

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://apartmanijovca.rs
NEXT_PUBLIC_SITE_NAME=Apartmani Jovca
```

### Optional Variables

```env
# Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Feature Flags
ENABLE_WHATSAPP=true
ENABLE_EMAIL_NOTIFICATIONS=true

# Performance
IMAGE_OPTIMIZATION=true
```

---

## Vercel Deployment

### Option 1: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Option 2: Deploy via Git Integration

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Framework Preset: Next.js
   - Build Command: `next build` (or `npm run build`)
   - Output Directory: `.next` (or leave empty)

3. **Configure Environment Variables:**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add all variables from `.env.production.example`
   - Set production values for each

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Note your deployment URL

---

## Domain Setup

### 1. Configure Custom Domain

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain: `apartmanijovca.rs` (or `www.apartmanijovca.rs`)
3. Follow the instructions to configure DNS records

### 2. DNS Configuration

Add the following records to your domain registrar:

| Type | Name | Value |
|------|------|-------|
| CNAME | www | cname.vercel-dns.com |
| A | @ | 76.76.21.21 |

### 3. SSL/HTTPS

Vercel automatically provides SSL certificates via Let's Encrypt. This is enabled by default for custom domains.

To force HTTPS:
```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ]
}
```

---

## Post-Deployment Verification

### 1. Functional Tests

- [ ] Homepage loads correctly
- [ ] Language switcher works (en, sr, de, it)
- [ ] Booking calendar displays availability
- [ ] Booking form submits successfully
- [ ] Confirmation email sends
- [ ] Admin login works
- [ ] Guest portal login works

### 2. Performance Check

Run Lighthouse audit:
```bash
npx vercel lighthouse https://your-domain.com
```

Expected results:
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

### 3. Security Check

- [ ] No sensitive data exposed in source
- [ ] All API routes protected appropriately
- [ ] Row Level Security policies active
- [ ] Security headers configured

---

## Troubleshooting

### Build Failures

1. **Missing environment variables:**
   - Check Vercel dashboard → Settings → Environment Variables
   - Ensure all required variables are set

2. **TypeScript errors:**
   - Run `npm run build` locally to identify issues
   - Check for deprecated API usage

### Runtime Errors

1. **Supabase connection issues:**
   - Verify Supabase URL is correct
   - Check API keys have correct permissions
   - Ensure database is not paused

2. **Email not sending:**
   - Check RESEND_API_KEY is valid
   - Verify "From" email is verified in Resend

### Performance Issues

1. **Slow initial load:**
   - Check Vercel function region (should be closest to users)
   - Enable image optimization
   - Implement lazy loading for components

---

## Maintenance

### Updating Production

1. **Via Git:**
   ```bash
   git add .
   git commit -m "Update description"
   git push origin main
   ```

2. **Via Vercel CLI:**
   ```bash
   vercel --prod
   ```

### Monitoring

1. Check Vercel Dashboard for function logs
2. Monitor Supabase Dashboard for query performance
3. Set up alerts for error rates

### Backups

- Supabase provides automatic database backups
- Download pg_dump for manual backups:
  ```bash
  pg_dump $DATABASE_URL > backup.sql
  ```

---

## Support

- Vercel Documentation: https://vercel.com/docs
- Next.js Documentation: https://nextjs.org/docs
- Supabase Documentation: https://supabase.com/docs
- Project Issues: https://github.com/your-repo/apartmani-jovca-next/issues

---

*Last updated: 2026-02-14*
