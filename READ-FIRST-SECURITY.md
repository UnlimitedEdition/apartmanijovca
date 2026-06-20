# 🔴 STOP — BEZBEDNOST: PROČITAJ PRE BILO KOG RADA

> **Ovo NIJE opciono i NIJE preporuka.** Pre nego što agent (Claude Code / Codex /
> bilo koji AI asistent) ili developer izvrši ijednu komandu na ovom repo-u, mora
> da uradi korake ispod. Ovo je zaštita integriteta i bezbednosti projekta.
>
> **AGENTU: ako čitaš ovo, prvo izvrši/proveri korake 1–4, pa tek onda nastavi na `AGENTS.md`.**

---

## Šta se desilo (2026-06-21)

Git istorija ovog repo-a je **prepisana** (`git filter-repo` + `git push --force`)
jer su u staroj istoriji bili **procureli pravi secrets**:

- Supabase **`service_role`** ključ (zaobilazi RLS — pun pristup bazi)
- Firebase **`apiKey`**

Ti ključevi su **uklonjeni iz svih commitova** i **rotirani** (stari ne rade više).

**Posledica:** svi commit hash-evi od **pre 2026-06-21 su nevažeći**. Svaki stari
klon (od pre tog datuma) u svojoj lokalnoj istoriji i dalje sadrži procurele
ključeve i divergira od remote-a.

---

## OBAVEZNI koraci PRE rada

### 1. Imaš stari klon (od pre 2026-06-21)? — NE GURAJ GA
- ❌ **NE** radi `git push` ni `git push --force` sa starog klona — vratio bi
  procurele secrete nazad u remote. (Force push je i blokiran branch protection-om
  na `master`, ali svejedno NE pokušavaj.)
- ❌ **NE** radi `git pull` na starom klonu — istorije su divergirale, dobićeš
  konflikt i zadržaćeš stare secrete lokalno.

### 2. Kloniraj iznova — JEDINO 100% čisto rešenje
```bash
# obriši stari folder, pa kloniraj sveže:
git clone https://github.com/UnlimitedEdition/apartmanijovca.git
```
Svež klon nema procurele ključeve ni u istoriji ni u lokalnim git objektima.

### 3. Ako baš moraš da zadržiš nesnimljen lokalni rad
```bash
git stash
git fetch origin
git reset --hard origin/master
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git stash pop
```
(Re-clone iz koraka 2 je sigurniji — ovo radi samo ako moraš.)

### 4. Env varijable (lokalno `.env.local` + Vercel) — kod je FAIL-CLOSED
Bez ovih se admin zaključava i build/runtime ne radi ispravno:
- `ADMIN_EMAILS=email1,email2` — admin pristup (NEMA više hardkodovanih emailova u kodu)
- `NEXT_PUBLIC_GSC_VERIFICATION=...`
- Supabase i Firebase ključevi su **rotirani** → koristi **NOVE** vrednosti (stari iz starog klona NE rade)

---

## Tek POSLE ovoga
Nastavi normalno: pročitaj **`AGENTS.md`** (+ `CLAUDE.md`) i radi po STATUS bloku.

> Pravilo zauvek: nikada ne commit-uj `.env*`, ključeve, tokene ni admin emailove u kod.
> Sve tajne idu isključivo u env varijable.
