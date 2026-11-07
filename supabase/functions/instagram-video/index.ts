import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const IG_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, range',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Cross-Origin-Resource-Policy': 'cross-origin',
};

function mediaIdToShortcode(mediaIdStr: string): string {
  let id = BigInt(String(mediaIdStr).split('_')[0]);
  let shortcode = '';
  while (id > 0n) {
    const remainder = Number(id % 64n);
    shortcode = IG_ALPHABET[remainder] + shortcode;
    id = id / 64n;
  }
  return shortcode;
}

function extractShortcode(input: string): string | null {
  if (!input) return null;
  if (/^[A-Za-z0-9_-]{8,15}$/.test(input)) return input;
  try {
    const u = new URL(input);
    const storyMediaId = u.searchParams.get('story_media_id');
    if (storyMediaId) {
      return mediaIdToShortcode(storyMediaId);
    }
    const match = u.pathname.match(/\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/);
    if (match) return match[1];
  } catch {
    // ignore URL parse error
  }
  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const reqUrl = new URL(req.url);
    const rawTarget = reqUrl.searchParams.get('url') || reqUrl.searchParams.get('shortcode') || '';
    const shortcode = extractShortcode(rawTarget);

    if (!shortcode) {
      return new Response(JSON.stringify({ error: 'Invalid Instagram URL or shortcode' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const embedUrl = `https://www.instagram.com/p/${shortcode}/embed`;
    const htmlRes = await fetch(embedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const html = await htmlRes.text();

    let videoUrl: string | null = null;
    const vMatch = html.match(/\\"video_url\\":\\"(https?:[^"]+)\\"/);
    if (vMatch) {
      try {
        const layer1 = JSON.parse(`"${vMatch[1]}"`);
        videoUrl = layer1.replace(/\\\//g, '/');
      } catch {
        videoUrl = vMatch[1].replace(/\\\\\//g, '/').replace(/\\\//g, '/').replace(/\\u0026/g, '&');
      }
    }

    if (!videoUrl) {
      return new Response(JSON.stringify({ error: 'Video URL not found on Instagram embed', shortcode }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (reqUrl.searchParams.get('format') === 'json') {
      return new Response(JSON.stringify({ shortcode, videoUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Stream directly from Instagram CDN
    const upstreamHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    };
    const range = req.headers.get('range');
    if (range) upstreamHeaders['Range'] = range;

    const videoRes = await fetch(videoUrl, { headers: upstreamHeaders });
    const responseHeaders = new Headers(corsHeaders);
    responseHeaders.set('Content-Type', videoRes.headers.get('Content-Type') || 'video/mp4');
    responseHeaders.set('Cache-Control', 'public, max-age=3600');
    const contentLength = videoRes.headers.get('Content-Length');
    if (contentLength) responseHeaders.set('Content-Length', contentLength);
    const contentRange = videoRes.headers.get('Content-Range');
    if (contentRange) responseHeaders.set('Content-Range', contentRange);
    const acceptRanges = videoRes.headers.get('Accept-Ranges');
    if (acceptRanges) responseHeaders.set('Accept-Ranges', acceptRanges);

    return new Response(videoRes.body, {
      status: videoRes.status,
      headers: responseHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
