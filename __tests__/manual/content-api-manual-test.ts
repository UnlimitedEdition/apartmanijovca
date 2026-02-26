/**
 * Manual Integration Test: Content API Section-Based Queries
 * 
 * This test verifies the content API works with the real database.
 * Run this manually to verify the implementation.
 * 
 * Prerequisites:
 * - Database must have content with keys like 'home.hero.title', 'contact.email'
 * - Environment variables must be set
 */

async function testContentAPI() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  console.log('Testing Content API Section-Based Queries...\n')
  
  // Test 1: GET with section parameter
  console.log('Test 1: GET /api/admin/content?section=home')
  try {
    const response = await fetch(`${baseUrl}/api/admin/content?section=home`)
    const data = await response.json()
    
    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(data, null, 2))
    
    if (response.status === 200 && data.content) {
      console.log('✓ Test 1 PASSED: Section-based GET works\n')
    } else {
      console.log('✗ Test 1 FAILED: Expected 200 status and content array\n')
    }
  } catch (error) {
    console.log('✗ Test 1 FAILED:', error, '\n')
  }
  
  // Test 2: GET with section and language
  console.log('Test 2: GET /api/admin/content?section=home&lang=en')
  try {
    const response = await fetch(`${baseUrl}/api/admin/content?section=home&lang=en`)
    const data = await response.json()
    
    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(data, null, 2))
    
    if (response.status === 200 && data.content) {
      console.log('✓ Test 2 PASSED: Section-based GET with language works\n')
    } else {
      console.log('✗ Test 2 FAILED: Expected 200 status and content array\n')
    }
  } catch (error) {
    console.log('✗ Test 2 FAILED:', error, '\n')
  }
  
  // Test 3: GET with key parameter (backward compatibility)
  console.log('Test 3: GET /api/admin/content?key=home.hero.title')
  try {
    const response = await fetch(`${baseUrl}/api/admin/content?key=home.hero.title`)
    const data = await response.json()
    
    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(data, null, 2))
    
    if (response.status === 200 && data.content && Array.isArray(data.content)) {
      console.log('✓ Test 3 PASSED: Key-based GET still works (backward compatibility)\n')
    } else {
      console.log('✗ Test 3 FAILED: Expected 200 status and content array\n')
    }
  } catch (error) {
    console.log('✗ Test 3 FAILED:', error, '\n')
  }
  
  // Test 4: POST with section and data
  console.log('Test 4: POST /api/admin/content with section data')
  try {
    const response = await fetch(`${baseUrl}/api/admin/content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        section: 'test',
        lang: 'en',
        data: {
          'field1': 'Test Value 1',
          'field2': 'Test Value 2'
        }
      })
    })
    const data = await response.json()
    
    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(data, null, 2))
    
    if (response.status === 200 && data.success) {
      console.log('✓ Test 4 PASSED: Section-based POST works\n')
    } else {
      console.log('✗ Test 4 FAILED: Expected 200 status and success=true\n')
    }
  } catch (error) {
    console.log('✗ Test 4 FAILED:', error, '\n')
  }
  
  // Test 5: Verify the data was saved correctly
  console.log('Test 5: Verify saved data - GET /api/admin/content?section=test&lang=en')
  try {
    const response = await fetch(`${baseUrl}/api/admin/content?section=test&lang=en`)
    const data = await response.json()
    
    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(data, null, 2))
    
    if (response.status === 200 && data.content && data.content.length > 0) {
      const enContent = data.content.find((c: any) => c.lang === 'en')
      if (enContent && enContent.data.field1 === 'Test Value 1' && enContent.data.field2 === 'Test Value 2') {
        console.log('✓ Test 5 PASSED: Data was saved and retrieved correctly\n')
      } else {
        console.log('✗ Test 5 FAILED: Data mismatch\n')
      }
    } else {
      console.log('✗ Test 5 FAILED: Expected 200 status and content\n')
    }
  } catch (error) {
    console.log('✗ Test 5 FAILED:', error, '\n')
  }
  
  console.log('Manual testing complete!')
}

// Run if executed directly
if (require.main === module) {
  testContentAPI().catch(console.error)
}

export { testContentAPI }
