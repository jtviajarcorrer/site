import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { Readable } from 'node:stream'

const IG_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

function mediaIdToShortcode(mediaIdStr) {
  let id = BigInt(String(mediaIdStr).split('_')[0])
  let shortcode = ''
  while (id > 0n) {
    const remainder = Number(id % 64n)
    shortcode = IG_ALPHABET[remainder] + shortcode
    id = id / 64n
  }
  return shortcode
}

function extractShortcode(input) {
  if (!input) return null
  if (/^[A-Za-z0-9_-]{8,15}$/.test(input)) return input
  try {
    const u = new URL(input)
    const storyMediaId = u.searchParams.get('story_media_id')
    if (storyMediaId) return mediaIdToShortcode(storyMediaId)
    const match = u.pathname.match(/\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/)
    if (match) return match[1]
  } catch {
    // ignore
  }
  return null
}

const igVideoStreamCache = new Map()

function instagramLiveStreamPlugin() {
  return {
    name: 'instagram-live-stream',
    configureServer(server) {
      server.middlewares.use('/api/ig-video', async (req, res) => {
        try {
          const reqUrl = new URL(req.url, 'http://localhost')
          const rawTarget = reqUrl.searchParams.get('url') || reqUrl.searchParams.get('shortcode') || ''
          const shortcode = extractShortcode(rawTarget)
          if (!shortcode) {
            res.statusCode = 400
            res.end('Invalid Instagram URL or shortcode')
            return
          }

          let videoUrl = igVideoStreamCache.get(shortcode)
          if (!videoUrl) {
            const embedRes = await fetch(`https://www.instagram.com/p/${shortcode}/embed`, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              },
            })
            const html = await embedRes.text()
            const vMatch = html.match(/\\"video_url\\":\\"(https?:[^"]+)\\"/)
            if (vMatch) {
              try {
                const layer1 = JSON.parse(`"${vMatch[1]}"`)
                videoUrl = layer1.replace(/\\\//g, '/')
              } catch {
                videoUrl = vMatch[1].replace(/\\\\\//g, '/').replace(/\\\//g, '/').replace(/\\u0026/g, '&')
              }
            }
            if (videoUrl) {
              igVideoStreamCache.set(shortcode, videoUrl)
            }
          }

          if (!videoUrl) {
            res.statusCode = 404
            res.end('Instagram video stream not found')
            return
          }

          const upstreamHeaders = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          }
          if (req.headers.range) {
            upstreamHeaders['Range'] = req.headers.range
          }

          const videoRes = await fetch(videoUrl, {
            method: req.method === 'HEAD' ? 'HEAD' : 'GET',
            headers: upstreamHeaders,
          })
          res.statusCode = videoRes.status
          res.setHeader('Content-Type', videoRes.headers.get('content-type') || 'video/mp4')
          res.setHeader('Cache-Control', 'public, max-age=3600')
          res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
          if (videoRes.headers.get('content-length')) {
            res.setHeader('Content-Length', videoRes.headers.get('content-length'))
          }
          if (videoRes.headers.get('content-range')) {
            res.setHeader('Content-Range', videoRes.headers.get('content-range'))
          }
          if (videoRes.headers.get('accept-ranges')) {
            res.setHeader('Accept-Ranges', videoRes.headers.get('accept-ranges'))
          }

          if (req.method === 'HEAD' || !videoRes.body) {
            res.end()
          } else {
            const nodeStream = Readable.fromWeb(videoRes.body)
            nodeStream.on('error', () => {
              if (!res.writableEnded) res.end()
            })
            res.on('close', () => {
              nodeStream.destroy()
            })
            nodeStream.pipe(res)
          }
        } catch (err) {
          res.statusCode = 500
          res.end(String(err))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    instagramLiveStreamPlugin(),
  ],
  // Expõe o servidor de desenvolvimento na rede local (acesso por http://<IP-da-máquina>:5173)
  server: {
    host: true,
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: true,
    port: 4173,
  },
})
