# Brevo email — podešavanje

Sajt šalje transakcione mejlove (potvrda rezervacije, zahtev adminu, check-in
uputstva, podsetnik, zahtev za recenziju). Podržana su **dva providera**: Resend
i Brevo. Ovo uputstvo je za **Brevo**.

## Kako kod bira providera

`getEmailProvider()` u `src/lib/resend.ts`:

1. Ako je `EMAIL_PROVIDER` env postavljen → koristi taj (`brevo` ili `resend`).
2. Inače auto: ako postoji `BREVO_API_KEY` → **Brevo**; inače ako postoji `RESEND_API_KEY` → Resend.
3. Ako nema nijednog → mock (ništa se ne šalje, vraća lažni uspeh).

Da Brevo bude aktivan, dovoljno je da postoji `BREVO_API_KEY`. Da budeš 100%
siguran (ako oba ključa postoje), setuj i `EMAIL_PROVIDER=brevo`.

## Koraci u Brevo dashboard-u

### 1. Napravi nalog i API ključ
- Registruj se na https://www.brevo.com (free tier: ~300 mejlova/dan).
- **SMTP & API → API Keys → Generate a new API key** → iskopiraj ključ.

### 2. Verifikuj pošiljaoca (sender) — OBAVEZNO
Brevo odbija slanje sa neverifikovane adrese.

- **Senders, Domains & Dedicated IPs → Senders → Add a sender**.
- Unesi ime (npr. „Apartmani Jovča") i email (npr. `apartmanijovca@gmail.com`).
- Brevo šalje verifikacioni link na tu adresu → klikni da potvrdiš.
- (Bolje za isporuku, opcionalno) **Domains → Authenticate a domain** kad budeš
  imao svoj domen → dodaš SPF/DKIM/DMARC DNS zapise. Bez ovoga gmail-pošiljalac
  radi, ali deo mejlova može u spam.

### 3. Env varijable na Vercel-u
**Project → Settings → Environment Variables** (scope: Production + Preview):

| Varijabla | Vrednost |
|---|---|
| `BREVO_API_KEY` | ključ iz koraka 1 |
| `EMAIL_FROM` | **tačno** adresa verifikovana u koraku 2 (npr. `apartmanijovca@gmail.com`) |
| `EMAIL_PROVIDER` | `brevo` (opciono, ali preporučeno) |

> ⚠️ `EMAIL_FROM` mora biti identičan verifikovanom sender-u. Default
> `onboarding@resend.dev` Brevo NEĆE prihvatiti.

Ako migriraš sa Resend-a u potpunosti, možeš ukloniti `RESEND_API_KEY`.

### 4. Redeploy
Env promene se primenjuju tek na novi build → **Deployments → Redeploy** (ili
`git push`).

## Provera da radi

1. Otvori `https://<sajt>/api/email?action=status` →
   ```json
   { "configured": true, "provider": "brevo", "fromEmail": "apartmanijovca@gmail.com", ... }
   ```
   Ako je `provider: null` → nijedan ključ nije učitan. Ako `provider: "resend"`
   → Brevo ključ ne postoji ili `EMAIL_PROVIDER=resend`.
2. Napravi test rezervaciju (ili admin „pošalji email") i proveri inbox/spam.
3. U Brevo dashboard-u: **Transactional → Logs / Statistics** vidiš svaki poslat mejl.

## Napomene / ograničenja

- **Praćenje isporuke** (`/api/webhooks/resend`) radi samo za Resend. Za Brevo
  delivery evente trebalo bi dodati zaseban Brevo webhook (nije urađeno).
- U produkciji `removeConsole: true` briše interne `console` logove, ali rezultat
  slanja se i dalje vidi u **odgovoru API-ja** i u **Brevo Logs**.
- Free tier ima dnevni limit (~300/dan) — dovoljno za rezervacije.
