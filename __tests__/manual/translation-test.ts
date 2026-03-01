/**
 * Manual test for translation key fix
 * 
 * Verifies that booking.messages.successSubtitle exists in all language files
 */

import * as fs from 'fs'
import * as path from 'path'

console.log('Testing translation key fixes...\n')

const locales = ['sr', 'en', 'de', 'it']
const expectedKey = 'booking.messages.successSubtitle'

let allPassed = true

for (const locale of locales) {
  const filePath = path.join(process.cwd(), 'messages', `${locale}.json`)
  
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(content)
    
    const hasKey = data.booking?.messages?.successSubtitle !== undefined
    const value = data.booking?.messages?.successSubtitle
    
    if (hasKey) {
      console.log(`✅ ${locale.toUpperCase()}: Key exists`)
      console.log(`   Value: "${value}"`)
    } else {
      console.log(`❌ ${locale.toUpperCase()}: Key missing`)
      allPassed = false
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.log(`❌ ${locale.toUpperCase()}: Error reading file - ${errorMessage}`)
    allPassed = false
  }
  
  console.log()
}

console.log('--- Test Summary ---')
if (allPassed) {
  console.log('✅ All translation keys present')
} else {
  console.log('❌ Some translation keys missing')
}
