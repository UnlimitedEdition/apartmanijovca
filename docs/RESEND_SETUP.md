# Resend Email Setup - Apartmani Jovča

## 🚀 Trenutna Konfiguracija

**Email Sender:** `onboarding@resend.dev` (Resend test mode)
**Admin Email:** `apartmanijovca@gmail.com`

## ⚠️ Važno: Resend bez Custom Domena

Resend zahteva **verifikovan domen** za slanje email-ova u produkciji. Bez domena, možeš koristiti **Test Mode**.

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
- ✅ Profesionalan izgled (`noreply@apartmanijovca.rs`)
- ✅ Neograničeno slanje
- ✅ Bolja deliverability

### Koraci:

1. **Kupi Domen:**
   - Preporučeni: `apartmanijovca.rs` ili `apartmanijovca.rs`
   - Cena: ~$10-15/godišnje
   - Registrari: Namecheap, GoDaddy, Hostinger

2. **Dodaj Domen u Resend:**
   - Idi na [Resend Domains](https://resend.com/domains)
   - Klikni "Add Domain"
   - Unesi svoj domen (npr. `apartmanijovca.rs`)

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
   EMAIL_FROM=noreply@apartmanijovca.rs
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
- Kupi domen (`apartmanijovca.rs`)
- Konfiguriši DNS zapise
- Promeni `EMAIL_FROM` na `noreply@apartmanijovca.rs`

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
