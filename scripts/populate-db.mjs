import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Read environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  console.error('URL:', supabaseUrl)
  console.error('Key:', supabaseKey ? 'present' : 'missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Read i18n files
const SECTIONS = ['home', 'apartments', 'attractions', 'location', 'prices', 'contact', 'gallery', 'footer']
const LANGUAGES = ['sr', 'en', 'de', 'it']

function flattenDict(obj, prefix = '') {
  const result = {}
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenDict(value, newKey))
    } else if (typeof value === 'string' && !value.includes('{{')) {
      result[newKey] = value
    }
  }
  return result
}

async function populateContent() {
  console.log('Starting content population...')
  
  const allRecords = []
  
  for (const lang of LANGUAGES) {
    const jsonPath = path.join(__dirname, '..', 'public', 'locales', lang, 'common.json')
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    
    for (const section of SECTIONS) {
      if (!data[section]) continue
      
      const flattened = flattenDict(data[section])
      
      for (const [key, value] of Object.entries(flattened)) {
        allRecords.push({
          key: `${section}.${key}`,
          language: lang,
          value,
          published: true
        })
      }
    }
  }
  
  console.log(`Total records to insert: ${allRecords.length}`)
  
  // Insert in batches of 100
  const batchSize = 100
  for (let i = 0; i < allRecords.length; i += batchSize) {
    const batch = allRecords.slice(i, i + batchSize)
    const { error } = await supabase
      .from('content')
      .upsert(batch, { onConflict: 'key,language' })
    
    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error)
    } else {
      console.log(`Inserted batch ${i / batchSize + 1} (${batch.length} records)`)
    }
  }
  
  console.log('Content population complete!')
}

populateContent().catch(console.error)
