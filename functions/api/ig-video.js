const IG_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

function mediaIdToShortcode(mediaIdStr) {
  let id = BigInt(String(mediaIdStr).split('_')[0]);
  let shortcode = '';
  while (id > 0n) {
    const remainder = Number(id % 64n);
    shortcode = IG_ALPHABET[remainder] + shortcode;
    id = id / 64n;
  }
  return shortcode;
}

function extractShortcode(input) {
  if (!input) return null;
  if (/^[A-Za-z0-9_-]{8,15}$/.test(input)) return input;
  try {
    const u = new URL(input);
    const storyMediaId = u.searchParams.get('story_media_id');
    if (storyMediaId) return mediaIdToShortcode(storyMediaId);
    const match = u.pathname.match(/\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/);
    if (match) return match[1];
  } catch {
    // ignore
  }
  return null;
}

export async function onRequestGet(context) {
  const { request } = context;
  const reqUrl = new URL(request.url);
  const rawTarget = reqUrl.searchParams.get('url') || reqUrl.searchParams.get('shortcode') || '';
  const shortcode = extractShortcode(rawTarget);

  if (!shortcode) {
    return new Response('Invalid Instagram URL or shortcode', { status: 400 });
  }

  const embedRes = await fetch(`https://www.instagram.com/p/${shortcode}/embed`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });

  const html = await embedRes.text();
  let videoUrl = null;

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
    return new Response('Instagram video stream not found', { status: 404 });
  }

  const upstreamHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  };
  const range = request.headers.get('range');
  if (range) upstreamHeaders['Range'] = range;

  const videoRes = await fetch(videoUrl, { headers: upstreamHeaders });
  const headers = new Headers();
  headers.set('Content-Type', videoRes.headers.get('Content-Type') || 'video/mp4');
  headers.set('Cache-Control', 'public, max-age=3600');
  if (videoRes.headers.get('Content-Length')) headers.set('Content-Length', videoRes.headers.get('Content-Length'));
  if (videoRes.headers.get('Content-Range')) headers.set('Content-Range', videoRes.headers.get('Content-Range'));
  if (videoRes.headers.get('Accept-Ranges')) headers.set('Accept-Ranges', videoRes.headers.get('Accept-Ranges'));

  return new Response(videoRes.body, {
    status: videoRes.status,
    headers,
  });
}
