#!/usr/bin/env node

/**
 * Update Contact Information in Supabase Database
 * 
 * This script updates all contact information in the database
 * to match the centralized configuration in src/lib/seo/config.ts
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Centralized contact information (should match src/lib/seo/config.ts)
const CONTACT_INFO = {
  email: 'apartmanijovca@gmail.com',
  phone: '+381 65 237 8080',
  whatsapp: '+381 65 237 8080'
}

const LANGUAGES = ['sr', 'en', 'de', 'it']

async function updateContactInfo() {
  console.log('🚀 Starting contact information update...\n')

  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Supabase credentials not found in .env.local')
    console.error('   Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log('📋 Contact information to update:')
  console.log(`   Email: ${CONTACT_INFO.email}`)
  console.log(`   Phone: ${CONTACT_INFO.phone}`)
  console.log(`   WhatsApp: ${CONTACT_INFO.whatsapp}\n`)

  // Update each language
  for (const lang of LANGUAGES) {
    console.log(`📝 Updating ${lang.toUpperCase()} site settings...`)

    try {
      // Fetch current data
      const { data: currentData, error: fetchError } = await supabase
        .from('content')
        .select('data')
        .eq('lang', lang)
        .eq('section', 'site_settings')
        .single()

      if (fetchError) {
        console.error(`   ❌ Error fetching ${lang} data:`, fetchError.message)
        continue
      }

      if (!currentData) {
        console.warn(`   ⚠️  No site_settings found for ${lang}`)
        continue
      }

      // Update contact information
      const updatedData = {
        ...currentData.data,
        contact_email: CONTACT_INFO.email,
        contact_phone: CONTACT_INFO.phone,
        whatsapp: CONTACT_INFO.whatsapp
      }

      // Save updated data
      const { error: updateError } = await supabase
        .from('content')
        .update({ data: updatedData })
        .eq('lang', lang)
        .eq('section', 'site_settings')

      if (updateError) {
        console.error(`   ❌ Error updating ${lang} data:`, updateError.message)
        continue
      }

      console.log(`   ✅ Successfully updated ${lang}`)
    } catch (error) {
      console.error(`   ❌ Unexpected error for ${lang}:`, error.message)
    }
  }

  console.log('\n🔍 Verifying updates...\n')

  // Verify all updates
  const { data: verifyData, error: verifyError } = await supabase
    .from('content')
    .select('lang, data')
    .eq('section', 'site_settings')
    .order('lang')

  if (verifyError) {
    console.error('❌ Error verifying updates:', verifyError.message)
    process.exit(1)
  }

  console.log('📊 Current database values:')
  console.log('─'.repeat(80))
  console.log('Lang | Email                      | Phone            | WhatsApp')
  console.log('─'.repeat(80))

  let allCorrect = true
  for (const row of verifyData) {
    const email = row.data.contact_email || 'N/A'
    const phone = row.data.contact_phone || 'N/A'
    const whatsapp = row.data.whatsapp || 'N/A'

    const emailMatch = email === CONTACT_INFO.email ? '✅' : '❌'
    const phoneMatch = phone === CONTACT_INFO.phone ? '✅' : '❌'
    const whatsappMatch = whatsapp === CONTACT_INFO.whatsapp ? '✅' : '❌'

    console.log(`${row.lang}   | ${email.padEnd(26)} ${emailMatch} | ${phone.padEnd(16)} ${phoneMatch} | ${whatsapp} ${whatsappMatch}`)

    if (email !== CONTACT_INFO.email || phone !== CONTACT_INFO.phone || whatsapp !== CONTACT_INFO.whatsapp) {
      allCorrect = false
    }
  }

  console.log('─'.repeat(80))

  if (allCorrect) {
    console.log('\n✅ All contact information updated successfully!')
    console.log('🎉 Database is now in sync with src/lib/seo/config.ts\n')
  } else {
    console.log('\n⚠️  Some values do not match. Please check the errors above.\n')
    process.exit(1)
  }
}

// Run the update
updateContactInfo().catch(error => {
  console.error('\n❌ Fatal error:', error)
  process.exit(1)
})
