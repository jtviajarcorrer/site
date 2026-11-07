// Otimização de imagens do Supabase Storage.
// As imagens espelhadas do Monday vêm em tamanho original (3–6 MB). Esta função troca a URL pública
// pela rota de transformação do Storage, que entrega a imagem redimensionada (WebP nos navegadores
// que suportam) — ~50–100 KB em vez de vários MB. URLs de outras origens passam sem alteração.
const PUBLIC = '/storage/v1/object/public/';
const RENDER = '/storage/v1/render/image/public/';

export function imgUrl(url, width, quality = 75) {
  if (!url || typeof url !== 'string' || !url.includes(PUBLIC)) return url;
  return `${url.replace(PUBLIC, RENDER)}?width=${width}&resize=contain&quality=${quality}`;
}
