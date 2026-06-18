-- 2026-06-19 — Transliteracija atrakcija: SR ćirilica -> latinica (name + description)
-- Razlog: seed je upisao SR na ćirilici (iz static src/data/attractions.ts), a ceo sajt je sr-RS latinica.
-- Idempotentno: transliteracija već-latiničnog teksta je no-op; menja SAMO redove sa ćirilicom. en/de/it se NE diraju.
-- Verifikovano na svih 11 (Сокобања->Sokobanja, Врмџанско->Vrmdžansko, Бубањ->Bubanj, Чегру->Čegru…).
-- Primena: Supabase SQL editor (paste) ili `supabase db push`. Žива odmah.

UPDATE public.attractions SET
  name = jsonb_set(
    name, '{sr}',
    to_jsonb(translate(
      replace(replace(replace(replace(replace(replace(name->>'sr','Љ','Lj'),'љ','lj'),'Њ','Nj'),'њ','nj'),'Џ','Dž'),'џ','dž'),
      'АБВГДЂЕЖЗИЈКЛМНОПРСТЋУФХЦЧШабвгдђежзијклмнопрстћуфхцчш',
      'ABVGDĐEŽZIJKLMNOPRSTĆUFHCČŠabvgdđežzijklmnoprstćufhcčš'))
  ),
  description = CASE
    WHEN description ? 'sr' THEN jsonb_set(
      description, '{sr}',
      to_jsonb(translate(
        replace(replace(replace(replace(replace(replace(description->>'sr','Љ','Lj'),'љ','lj'),'Њ','Nj'),'њ','nj'),'Џ','Dž'),'џ','dž'),
        'АБВГДЂЕЖЗИЈКЛМНОПРСТЋУФХЦЧШабвгдђежзијклмнопрстћуфхцчш',
        'ABVGDĐEŽZIJKLMNOPRSTĆUFHCČŠabvgdđežzijklmnoprstćufhcčš')))
    ELSE description
  END,
  updated_at = now()
WHERE name->>'sr' ~ '[Ѐ-ӿ]' OR description->>'sr' ~ '[Ѐ-ӿ]';

-- Provera posle:
-- SELECT display_order, name->>'sr', left(description->>'sr', 50) FROM public.attractions ORDER BY display_order;
