import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File

    if (!image) {
      return NextResponse.json({ error: 'Niste izabrali sliku' }, { status: 400 })
    }

    const API_KEY = process.env.IMGBB_API_KEY
    if (!API_KEY || API_KEY === 'your_imgbb_api_key_here') {
      return NextResponse.json({ 
        error: 'Sistem za otpremanje nije konfigurisan. Molimo unesite IMGBB_API_KEY u .env.local fajl.' 
      }, { status: 500 })
    }

    // Prepare FormData for ImgBB
    const imgbbFormData = new FormData()
    imgbbFormData.append('image', image)

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
      method: 'POST',
      body: imgbbFormData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || 'Neuspešno otpremanje slike na ImgBB')
    }

    const result = await response.json()
    
    // Return the full data or just the URL
    return NextResponse.json({ 
      url: result.data.url,
      delete_url: result.data.delete_url,
      display_url: result.data.display_url
    })

  } catch (err: unknown) {
    const error = err as Error
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
