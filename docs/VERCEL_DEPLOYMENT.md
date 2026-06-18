# Vercel Deployment Guide - Apartmani Jovča

## ⚠️ SIGURNOSNO UPOZORENJE

**NIKAD ne commit-uj sledeće u git:**
- `.env.local` fajl
- API keys, tokens, ili secrets
- Supabase Service Role Key
- Database passwords
- Email API keys

Sve secrets moraju biti dodati direktno u Vercel Dashboard kao Environment Variables!

---

## Korak po korak uputstvo za deployment na Vercel

### 1. Priprema projekta

Projekat je već pripremljen i push-ovan na GitHub:
- Repository: https://github.com/UnlimitedEdition/apartmanijovca.git
- Branch: master

### 2. Kreiranje Vercel projekta

1. Idi na [Vercel Dashboard](https://vercel.com/dashboard)
2. Klikni na "Add New Project"
3. Importuj GitHub repository: `UnlimitedEdition/apartmanijovca`
4. Vercel će automatski detektovati Next.js framework

### 3. Konfiguracija Environment Variables

**VAŽNO:** Moraš dodati sledeće environment variables u Vercel Dashboard:

#### Obavezne promenljive:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://apartmanijovca.vercel.app
NEXT_PUBLIC_APP_NAME=Apartmani Jovca

# Email Configuration (Resend)
RESEND_API_KEY=your-resend-api-key-here

# Admin Configuration
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD_HASH=placeholder_will_be_generated

# Image Upload APIs
IMGBB_API_KEY=your-imgbb-api-key-here
POSTIMAGES_API_KEY=your-postimages-api-key-here
```

#### Opcione promenljive (za WhatsApp):

```bash
WHATSAPP_BUSINESS_ACCOUNT_ID=placeholder
WHATSAPP_PHONE_NUMBER_ID=placeholder
WHATSAPP_ACCESS_TOKEN=placeholder
```

### 4. Kako dodati Environment Variables u Vercel

1. U Vercel Dashboard, otvori svoj projekat
2. Idi na **Settings** → **Environment Variables**
3. Za svaku promenljivu:
   - Unesi **Key** (npr. `NEXT_PUBLIC_SUPABASE_URL`)
   - Unesi **Value** (kopiraj iz svog `.env.local` fajla)
   - Selektuj **Production**, **Preview**, i **Development**
   - Klikni **Save**

**VAŽNO:** Nikad ne deli javno svoje API keys i secrets!

### 5. Build Settings

Vercel će automatski koristiti ove settings (već konfigurisano u `vercel.json`):

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "outputDirectory": ".next"
}
```

### 6. Deploy

1. Nakon što dodaš sve environment variables, klikni **Deploy**
2. Vercel će automatski:
   - Instalirati dependencies
   - Build-ovati projekat
   - Deploy-ovati na production URL

### 7. Custom Domain (opciono)

Ako želiš da koristiš custom domain (npr. `apartmanijovca.rs`):

1. Idi na **Settings** → **Domains**
2. Dodaj svoj domain
3. Konfiguriši DNS records kod svog domain providera:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### 8. Provera deployment-a

Nakon uspešnog deployment-a:

1. Otvori production URL (npr. `https://apartmanijovca.vercel.app`)
2. Proveri da li se stranica učitava
3. Testiraj:
   - Language switcher (SR, EN, DE, IT)
   - Booking flow
   - Admin panel (`/admin/login`)
   - Contact form

### 9. Česte greške i rešenja

#### Greška: "Invalid Supabase URL"
**Rešenje:** Proveri da li si dodao `NEXT_PUBLIC_SUPABASE_URL` u Environment Variables

#### Greška: "Build failed"
**Rešenje:** Proveri build logs u Vercel Dashboard. Najčešće je problem sa:
- Nedostajućim environment variables
- TypeScript greškama
- Missing dependencies

#### Greška: "Module not found"
**Rešenje:** Proveri da li su svi dependencies u `package.json`

#### Greška: "API route not working"
**Rešenje:** Proveri da li si dodao `SUPABASE_SERVICE_ROLE_KEY` (bez `NEXT_PUBLIC_` prefiksa)

### 10. Continuous Deployment

Vercel automatski deploy-uje svaki put kada push-uješ na GitHub:
- Push na `master` branch → Production deployment
- Push na druge branch-eve → Preview deployment

### 11. Monitoring

U Vercel Dashboard možeš pratiti:
- **Analytics**: Broj poseta, performance
- **Logs**: Runtime logs za debugging
- **Speed Insights**: Performance metrics

---

## Brzi checklist pre deployment-a

- [ ] Projekat je push-ovan na GitHub
- [ ] Vercel projekat je kreiran i povezan sa GitHub repo
- [ ] Sve environment variables su dodate u Vercel Dashboard
- [ ] `NEXT_PUBLIC_SITE_URL` je postavljen na production URL
- [ ] Build je uspešan
- [ ] Stranica se učitava na production URL
- [ ] Admin panel radi
- [ ] Booking flow radi
- [ ] Contact form radi

---

## Dodatne napomene

### Environment Variables prioritet:

1. **NEXT_PUBLIC_*** - Dostupne na client-side (browser)
2. **Bez prefiksa** - Dostupne samo na server-side (API routes)

### Sigurnost:

- **NIKAD** nemoj commit-ovati `.env.local` u git
- **SUPABASE_SERVICE_ROLE_KEY** mora biti samo server-side
- Koristi Vercel Environment Variables za production secrets

### Performance:

- Vercel automatski optimizuje Next.js aplikacije
- Edge Functions su dostupne za brže API responses
- Image optimization je automatski uključen

---

## Pomoć

Ako imaš problema sa deployment-om:

1. Proveri Vercel build logs
2. Proveri da li su sve environment variables dodate
3. Testiraj lokalno sa `npm run build` i `npm start`
4. Kontaktiraj Vercel support ako problem persists
