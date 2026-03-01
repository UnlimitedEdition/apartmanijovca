import { v2 as cloudinary } from 'cloudinary'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
config({ path: join(__dirname, '../.env.local') })

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

async function testUpload() {
  console.log('🚀 Testing Cloudinary upload...')
  console.log('Cloud Name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)

  try {
    // Test upload with a sample image URL
    const result = await cloudinary.uploader.upload(
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      {
        folder: 'apartmani-jovca/test',
        public_id: 'test-image',
      }
    )

    console.log('✅ Upload successful!')
    console.log('URL:', result.secure_url)
    console.log('Public ID:', result.public_id)

    // Test optimized URL generation
    const optimizedUrl = cloudinary.url(result.public_id, {
      fetch_format: 'auto',
      quality: 'auto',
      width: 500,
      height: 500,
      crop: 'fill',
    })

    console.log('🎨 Optimized URL:', optimizedUrl)

    // Clean up - delete test image
    await cloudinary.uploader.destroy(result.public_id)
    console.log('🗑️  Test image deleted')
  } catch (error) {
    console.error('❌ Upload failed:', error)
  }
}

testUpload()
