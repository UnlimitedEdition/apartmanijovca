# Brevo — Vodič za povezivanje (za Nikolu)

> Cilj: da **svi gosti** primaju email (potvrde rezervacije, podsetnici, itd.).
> Trenutni problem: Resend test mod (`onboarding@resend.dev`) šalje **samo** na adresu
> vlasnika Resend naloga, pa pravi gosti ne dobijaju email.
>
> Rešenje u ovom vodiču: **Brevo** — šalje bilo kome nakon verifikacije jednog sender
> emaila (jedan klik), **bez kupovine domena** i **bez Gmail App Password-a**. Besplatno do
> **300 mejlova/dan**.

Kod je već spreman na grani `claude/email-delivery-issue-l35gg5`. Tvoj jedini zadatak je da
napraviš Brevo nalog, verifikuješ sender i postaviš 1–2 environment varijable u Vercel-u.

---

## Korak 1 — Napravi Brevo nalog

1. Idi na **https://www.brevo.com/** → **Sign up free**.
2. Registruj se (možeš i preko Google login-a sa `apartmanijovca@gmail.com`).
3. Pri registraciji preskoči/odbij plaćene planove — besplatan plan je dovoljan.

---

## Korak 2 — Verifikuj sender email (NAJVAŽNIJE)

Ovo je adresa sa koje gosti primaju email. Mora se verifikovati, inače slanje ne radi.

1. U Brevo levom meniju: **Senders, Domains & Dedicated IPs** (ili klikni na ime naloga →
   **Senders & IP**).
2. Tab **Senders** → **Add a sender**.
3. Unesi:
   - **From Name:** `Apartmani Jovča`
   - **From Email:** `apartmanijovca@gmail.com`
4. Klikni **Save**. Brevo šalje verifikacioni mejl na `apartmanijovca@gmail.com`.
5. Otvori taj inbox → klikni **link za verifikaciju**. Sender mora biti označen kao
   **Verified** ✅.

> ⚠️ Email koji verifikuješ ovde MORA biti identičan onome što ide u `BREVO_SENDER_EMAIL`
> (Korak 4). Ako se ne poklapaju, slanje će padati.

---

## Korak 3 — Generiši API ključ

1. U Brevo: gornji desni ugao → ime naloga → **SMTP & API** (ili direktno
   **https://app.brevo.com/settings/keys/api**).
2. Tab **API Keys** → **Generate a new API key**.
3. Daj mu ime (npr. `apartmani-vercel`) → **Generate**.
4. **Kopiraj ključ ODMAH** (počinje sa `xkeysib-...`). Prikazuje se samo jednom.

---

## Korak 4 — Postavi Environment Variables u Vercel

1. Idi na **https://vercel.com** → projekat **apartmani-jovca** → **Settings** →
   **Environment Variables**.
2. Dodaj sledeće (Environment: **Production** — po želji i Preview/Development):

   | Name | Value | Obavezno? |
   |------|-------|-----------|
   | `BREVO_API_KEY` | `xkeysib-...` (ključ iz Koraka 3) | ✅ Da |
   | `BREVO_SENDER_EMAIL` | `apartmanijovca@gmail.com` | ⬜ Opciono* |

   \* Ako izostaviš `BREVO_SENDER_EMAIL`, kod sam koristi `apartmanijovca@gmail.com`. Postavi
   je samo ako želiš drugu (verifikovanu!) adresu.

3. Klikni **Save** za svaku.

---

## Korak 5 — Redeploy

Environment varijable se primenjuju tek nakon novog deploy-a.

- **Vercel → Deployments → ⋯ (na poslednjem deploy-u) → Redeploy**, ili
- napravi bilo kakav `git push` na produkcionu granu.

Čim se deploy završi → **svi gosti primaju email.**

---

## Korak 6 — Provera da radi

**Brzi health-check (status servisa):**

Otvori u browseru (zameni domen ako treba):
```
https://apartmani-jovca.vercel.app/api/email?action=status
```
Treba da vrati `"configured": true`.

**Pravi test:**
1. Napravi test rezervaciju sa **Nikolinom adresom** (ili bilo kojom drugom).
2. Email treba da stigne sa pošiljaocem **Apartmani Jovča `<apartmanijovca@gmail.com>`**
   (NE više `onboarding@resend.dev`).

**Ako email ne stigne — gde gledati:**
- **Brevo → Transactional → Logs / Statistics** — vidiš svaki pokušaj slanja i razlog
  greške (npr. „sender not verified").
- **Vercel → projekat → Logs (Runtime)** — traži poruke `via Brevo` ili greške slanja.
- Najčešća greška: sender u Koraku 2 nije verifikovan, ili se `BREVO_SENDER_EMAIL` ne
  poklapa sa verifikovanim senderom.

---

## Kako kod bira provajdera (info za Nikolu)

Logika je u `src/lib/resend.ts`, funkcija `sendEmail()`:

```
ako je BREVO_API_KEY postavljen   → šalji preko Brevo (na bilo koju adresu)
inače                              → šalji preko Resend (test mod, ograničen)
```

- Ništa se ne menja u email šablonima ni u servisima — samo se bira transport.
- Verifikovani sender + API ključ su jedino što Brevo traži; **domen NIJE potreban**.

---

## Kasnije: prelazak na custom domen (opciono, kad stigne domen)

Kad kupite domen (npr. `apartmani-jovca.com`), dve opcije:

- **Ostani na Brevo:** dodaj domen u Brevo (Domains → Authenticate), postavi
  `BREVO_SENDER_EMAIL=noreply@apartmani-jovca.com`. Bolja deliverability, profesionalan
  pošiljalac.
- **Vrati se na Resend:** verifikuj domen u Resend-u, postavi `EMAIL_FROM=noreply@...` i
  **ukloni `BREVO_API_KEY`** iz Vercel-a — kod se automatski vraća na Resend.

---

## Checklist

- [ ] Brevo nalog napravljen
- [ ] Sender `apartmanijovca@gmail.com` **Verified** ✅
- [ ] API ključ generisan i sačuvan
- [ ] `BREVO_API_KEY` dodat u Vercel (Production)
- [ ] (opciono) `BREVO_SENDER_EMAIL` dodat
- [ ] Redeploy urađen
- [ ] `/api/email?action=status` vraća `configured: true`
- [ ] Test email stigao na ne-Resend adresu
