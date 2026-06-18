import { ImageResponse } from 'next/og'

export const alt = 'Apartmani Jovča — Bovansko jezero'

export const size = { width: 1200, height: 630 }

export const contentType = 'image/png'

export default async function Image(): Promise<ImageResponse> {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)',
          padding: '60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
          }}
        >
          <div
            style={{
              fontSize: '72px',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-1px',
              textAlign: 'center',
              lineHeight: 1.1,
            }}
          >
            Apartmani Jovča
          </div>
          <div
            style={{
              fontSize: '32px',
              fontWeight: 400,
              color: '#bfdbfe',
              textAlign: 'center',
              lineHeight: 1.4,
            }}
          >
            Smeštaj na Bovanskom jezeru / Bovan Lake
          </div>
          <div
            style={{
              marginTop: '16px',
              width: '80px',
              height: '4px',
              background: '#93c5fd',
              borderRadius: '2px',
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  )
}
