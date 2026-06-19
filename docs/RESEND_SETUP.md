# Email Setup - Apartmani Jovča

## 🚀 Trenutna Konfiguracija

**Email Sender:** `onboarding@resend.dev` (Resend test mode)
**Admin Email:** `apartmanijovca@gmail.com`

## ⚠️ Važno: Resend bez Custom Domena

Resend zahteva **verifikovan domen** za slanje email-ova u produkciji. Bez domena, Resend
**test mode šalje SAMO na email adresu vlasnika Resend naloga** — pravi gosti NEĆE primiti email.

---

## ✅ PREPORUKA: Brevo kao most do domena (bez domena, bez App Password-a)

Dok ne stigne custom domen, koristi **Brevo** (bivši Sendinblue). Brevo dozvoljava slanje na
**bilo koju adresu** nakon što verifikuješ **jedan jedini sender email klikom** — bez domena i
bez Gmail App Password-a. Besplatno do **300 mejlova/dan**.

Kod automatski bira provajdera: **ako je `BREVO_API_KEY` postavljen → koristi Brevo**, u
suprotnom pada na Resend. Nikakva izmena koda nije potrebna pri prebacivanju.

### Setup (jednokratno, ~5 min):

1. Registruj se na [Brevo](https://www.brevo.com/) (besplatno).
2. **Senders, Domains & Dedicated IPs → Senders → Add a sender:**
   - Unesi `apartmanijovca@gmail.com` i potvrdi klikom na link iz verifikacionog mejla.
3. **SMTP & API → API Keys → Generate a new API key**, kopiraj ga.
4. U **Vercel → Environment Variables** dodaj:
   ```bash
   BREVO_API_KEY=xkeysib-...
   # Opcionalno (default je apartmanijovca@gmail.com):
   BREVO_SENDER_EMAIL=apartmanijovca@gmail.com
   ```
   > ⚠️ `BREVO_SENDER_EMAIL` MORA biti tačno ona adresa koju si verifikovao u koraku 2.
5. Redeploy. Od tog trenutka **svi gosti primaju email**.

Kad kasnije verifikuješ domen u Resend-u, samo ukloni `BREVO_API_KEY` iz Vercel-a (ili ostavi
Brevo + dodaj domen u Brevo) — kod se sam vraća na Resend.

---

## 📋 Opcija 1: Test Mode (Trenutno Aktivno)

### Prednosti:
- ✅ Besplatno
- ✅ Ne zahteva domen
- ✅ Radi odmah

### Ograničenja:
- ⚠️ Email-ovi se šalju samo na **verified email adrese**
- ⚠️ Sender je `onboarding@resend.dev` (ne tvoj brend)
- ⚠️ Limitirano na testiranje

### Setup:

1. **Verifikuj Email Adrese u Resend:**
   - Idi na [Resend Dashboard](https://resend.com/emails)
   - Settings → Verified Emails
   - Dodaj: `apartmanijovca@gmail.com`
   - Klikni verification link u email-u

2. **Environment Variables (Vercel):**
   ```bash
   RESEND_API_KEY=re_your_api_key_here
   EMAIL_FROM=onboarding@resend.dev
   ```

3. **Testiranje:**
   - Booking confirmation će stizati na `apartmanijovca@gmail.com`
   - Drugi email-ovi neće raditi dok ne verifikuješ te adrese

---

## 📋 Opcija 2: Custom Domen (Za Produkciju)

### Prednosti:
- ✅ Profesionalan izgled (`noreply@apartmani-jovca.com`)
- ✅ Neograničeno slanje
- ✅ Bolja deliverability

### Koraci:

1. **Kupi Domen:**
   - Preporučeni: `apartmani-jovca.com` ili `apartmanijovca.rs`
   - Cena: ~$10-15/godišnje
   - Registrari: Namecheap, GoDaddy, Hostinger

2. **Dodaj Domen u Resend:**
   - Idi na [Resend Domains](https://resend.com/domains)
   - Klikni "Add Domain"
   - Unesi svoj domen (npr. `apartmani-jovca.com`)

3. **Konfiguriši DNS Zapise:**
   Resend će ti dati DNS zapise koje treba da dodaš:
   
   ```
   Type: TXT
   Name: resend._domainkey
   Value: [Resend će dati vrednost]
   
   Type: MX
   Name: @
   Value: feedback-smtp.resend.com
   Priority: 10
   ```

4. **Verifikuj Domen:**
   - Sačekaj 24-48h za DNS propagaciju
   - Klikni "Verify" u Resend dashboard-u

5. **Ažuriraj Environment Variables:**
   ```bash
   EMAIL_FROM=noreply@apartmani-jovca.com
   ```

---

## 📋 Opcija 3: Alternativni Email Servisi

Ako ne želiš da kupiš domen odmah, možeš koristiti:

### **SendGrid** (Besplatno)
- 100 email-ova/dan besplatno
- Ne zahteva custom domen za testiranje
- [Signup](https://sendgrid.com/)

### **Mailgun** (Besplatno)
- 5,000 email-ova/mesec besplatno
- Ne zahteva custom domen za testiranje
- [Signup](https://www.mailgun.com/)

### **Gmail SMTP** (Besplatno)
- 500 email-ova/dan
- Koristi Gmail account sa App Password
- Jednostavno za setup

---

## 🔧 Kako Promeniti Email Servis

Svi email-ovi se šalju kroz `src/lib/resend.ts`. Da promeniš servis:

1. Instaliraj novi paket (npr. `npm install nodemailer` za Gmail)
2. Ažuriraj `src/lib/resend.ts` da koristi novi servis
3. Postavi environment variables

---

## 📊 Trenutno Stanje

| Komponenta | Status | Napomena |
|------------|--------|----------|
| Resend API Key | ✅ Povezan | Postavljen u Vercel |
| Email Sender | ⚠️ Test Mode | `onboarding@resend.dev` |
| Admin Email | ✅ Konfigurisano | `apartmanijovca@gmail.com` |
| Custom Domen | ❌ Nije podešen | Potreban za produkciju |

---

## 🎯 Preporuka

**Za sada (testiranje):**
- Koristi Test Mode sa `onboarding@resend.dev`
- Verifikuj `apartmanijovca@gmail.com` u Resend-u

**Za produkciju (pre launch-a):**
- Kupi domen (`apartmani-jovca.com`)
- Konfiguriši DNS zapise
- Promeni `EMAIL_FROM` na `noreply@apartmani-jovca.com`

---

## 📞 Podrška

Ako imaš problema:
1. Proveri Resend Dashboard → Logs
2. Proveri Vercel Logs za greške
3. Proveri da li je `RESEND_API_KEY` postavljen u Vercel Environment Variables

## 🔗 Korisni Linkovi

- [Resend Dashboard](https://resend.com/emails)
- [Resend Domains](https://resend.com/domains)
- [Resend Documentation](https://resend.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
