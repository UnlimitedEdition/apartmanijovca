import { NextRequest, NextResponse } from 'next/server'
import { uploadImage } from '@/lib/cloudinary'
import { requireAdmin } from '@/lib/auth/require-admin'

export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File

    if (!image) {
      return NextResponse.json({ error: 'Niste izabrali sliku' }, { status: 400 })
    }

    // Check Cloudinary configuration
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ 
        error: 'Cloudinary nije konfigurisan. Proverite .env.local fajl.' 
      }, { status: 500 })
    }

    // Convert file to base64 for Cloudinary upload
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${image.type};base64,${buffer.toString('base64')}`

    // Upload to Cloudinary
    const result = await uploadImage(base64, 'apartmani-jovca/gallery')

    if (!result.success) {
      throw new Error(result.error || 'Neuspešno otpremanje slike na Cloudinary')
    }

    // Return the URL
    return NextResponse.json({ 
      url: result.url,
      publicId: result.publicId
    })

  } catch (err: unknown) {
    console.error('Gallery upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
