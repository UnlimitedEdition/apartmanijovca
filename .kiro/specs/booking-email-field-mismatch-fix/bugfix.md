# Dokument zahteva za ispravku greške

## Uvod

Kritična greška sprečava kreiranje rezervacija u sistemu. Kada korisnici pokušaju da kreiraju rezervaciju, dobijaju 406 i 400 greške od Supabase API-ja, i rezervacija ne uspeva da se sačuva. Greška se javlja zbog neusklađenosti naziva polja između objekta gosta koji se prosleđuje email šablonu i interfejsa koji šablon očekuje.

U fajlu `src/app/api/booking/route.ts` na liniji 143, kod prosleđuje objekat gosta sa poljem `name` u BookingRequestEmail šablon, ali šablon očekuje polje `full_name`. Ova neusklađenost uzrokuje neuspeh renderovanja email-a i neuspeh kreiranja rezervacije.

## Analiza greške

### Trenutno ponašanje (defekt)

1.1 KADA se kreira rezervacija TADA sistem prosleđuje objekat gosta sa poljem `name` umesto `full_name` u BookingRequestEmail šablon

1.2 KADA BookingRequestEmail šablon primi objekat gosta sa poljem `name` TADA TypeScript prijavljuje grešku: `'name' does not exist in type '{ full_name: string; email: string; phone: string; }'`

1.3 KADA se pokuša renderovanje email-a sa neispravnim poljem TADA renderovanje email-a ne uspeva

1.4 KADA renderovanje email-a ne uspe TADA Supabase API vraća 406 grešku na `/rest/v1/guests?select=id&email=eq.ja.chimbe%40gmail.com`

1.5 KADA Supabase API vrati 406 grešku TADA sistem vraća 400 grešku i rezervacija ne uspeva da se sačuva

### Očekivano ponašanje (ispravno)

2.1 KADA se kreira rezervacija TADA sistem TREBA DA prosleđuje objekat gosta sa poljem `full_name` u BookingRequestEmail šablon

2.2 KADA BookingRequestEmail šablon primi objekat gosta sa poljem `full_name` TADA TypeScript TREBA DA validira tip bez grešaka

2.3 KADA se pokuša renderovanje email-a sa ispravnim poljem TADA renderovanje email-a TREBA DA uspe

2.4 KADA renderovanje email-a uspe TADA Supabase API TREBA DA uspešno kreira gosta i rezervaciju

2.5 KADA Supabase API uspešno kreira rezervaciju TADA sistem TREBA DA vrati status 201 sa podacima o rezervaciji

### Nepromenjeno ponašanje (prevencija regresije)

3.1 KADA se kreira rezervacija sa validnim podacima TADA sistem TREBA DA NASTAVI DA kreira gosta u bazi podataka

3.2 KADA se kreira rezervacija sa validnim podacima TADA sistem TREBA DA NASTAVI DA kreira rezervaciju u bazi podataka

3.3 KADA se kreira rezervacija TADA sistem TREBA DA NASTAVI DA šalje admin notifikacioni email

3.4 KADA slanje email-a ne uspe TADA sistem TREBA DA NASTAVI DA kreira rezervaciju (email greška ne treba da blokira rezervaciju)

3.5 KADA se kreira rezervacija TADA sistem TREBA DA NASTAVI DA vraća objekat rezervacije sa svim potrebnim poljima (bookingNumber, checkIn, checkOut, totalPrice, apartmentName, guestName, guestEmail, guestPhone)

3.6 KADA se kreira rezervacija sa opcionalnim telefonom gosta TADA sistem TREBA DA NASTAVI DA koristi prazan string ako telefon nije naveden

3.7 KADA se kreira rezervacija TADA sistem TREBA DA NASTAVI DA koristi lokalizaciju iz zahteva
