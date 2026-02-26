import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY! // Needs service role to bypass RLS for initial sync

export async function POST() {
  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey)
    const languages = ['en', 'sr', 'de', 'it']
    const results = []

    for (const lang of languages) {
      const filePath = path.join(process.cwd(), 'messages', `${lang}.json`)
      if (!fs.existsSync(filePath)) continue

      const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      const sections = ['home', 'about', 'prices', 'contact', 'footer']
      
      for (const section of sections) {
        if (fileContent[section]) {
          await supabaseAdmin
            .from('content')
            .upsert({
              section,
              lang,
              data: fileContent[section],
              published: true,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'section, lang'
            })
          results.push({ lang, section, status: 'success' })
        }
      }
    }

    // --- 2. Initialize Default Apartments if none exist ---
    const { count: apartmentCount } = await supabaseAdmin
      .from('apartments')
      .select('*', { count: 'exact', head: true })

    if (apartmentCount === 0) {
      const defaultApartments = [
        {
          name: 'Deluxe Lake View Apartment',
          type: 'deluxe',
          capacity: 4,
          base_price_eur: 120,
          description: 'Luxurious apartment with a stunning 180-degree view of Bovan Lake. Features a large terrace and premium amenities.',
          images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80']
        },
        {
          name: 'Family Garden Suite',
          type: 'family',
          capacity: 6,
          base_price_eur: 150,
          description: 'Spacious ground floor suite with direct access to the garden and BBQ area. Perfect for families with kids.',
          images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80']
        },
        {
          name: 'Standard Studio',
          type: 'standard',
          capacity: 2,
          base_price_eur: 80,
          description: 'Cozy and modern studio perfect for couples looking for a quiet getaway near the nature.',
          images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80']
        }
      ]

      const { error: apartmentError } = await supabaseAdmin
        .from('apartments')
        .insert(defaultApartments)

      if (!apartmentError) {
        results.push({ category: 'apartments', status: 'initialized' })
      }
    }

    return NextResponse.json({ 
      message: 'Sync completed', 
      details: results 
    })

  } catch (err: unknown) {
    const error = err as Error
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
