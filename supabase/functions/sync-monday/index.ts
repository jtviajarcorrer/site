// sync-monday — sincroniza as expedições do quadro "Roteiro" (Monday da JT) para a tabela public.expeditions.
//
// Regras:
//  - Só entram expedições com a coluna "Destaque no Site" marcada.
//  - Quem foi desmarcado no Monday continua no banco, mas com highlight = false (some do site).
//  - O site decide "futura" ou "encerrada" pela data; o status do Monday não filtra nada.
//  - Campos que o Monday não fornece (country, spots_left, imagens ausentes) NÃO são sobrescritos.
//
// Autenticação: cabeçalho x-sync-secret == secret SYNC_SECRET (verify_jwt desligado de propósito,
// porque quem chama é o pg_cron via pg_net).
import { createClient } from 'npm:@supabase/supabase-js@2';

const MONDAY_URL = 'https://api.monday.com/v2';
const BOARD_ROTEIRO = 7384517730;
const BUCKET = 'expedition-media';

// Colunas do quadro Roteiro
const COL = {
  status: 'status__1',
  cronograma: 'cronograma__1',
  distancias: 'dropdown_mm2mcvam',
  destino: 'link_to_destinos__1',
  produto: 'link_to_produto_mkkwhahz',
  slogan: 'text_mm4bbggk',
  descricao: 'long_text_mm4bt1r9',
  vagas: 'numeric_mm4tf2nf', // Qt Pax Pagantes (BI)
  destaque: 'boolean_mm4b8z5m',
  fotos: 'file_mm81ydad',
  logoProva: 'file_mm8xk0pr',
  atracoes: 'board_relation_mkmvkhy0',
};
// Colunas do quadro Produto
const PROD = {
  aVista: 'numeric_mkt6b0ey',
  entrada: 'numeric_mkt6h352',
  maxParcelas: 'numeric_mkt6epez',
  valorParcela: 'numeric_mkt6nsxk',
  incluso: 'id_clausula_a',
  naoIncluso: 'id_clausula_a_b',
  siteNaoIncluso: 'text_mm81d3xb',
  status: 'color_mkt6h3gf',
  tipo: 'color_mm90g852',
  // Quadro Destinos: arquivo "capa" — é daqui que o ADV pega o fundo da expedição
  destinoCapa: 'file_mm1ww2gr',
};

const ROTEIRO_COLUMNS = Object.values(COL).map((c) => `"${c}"`).join(',');
const PRODUTO_COLUMNS = Object.values(PROD).map((c) => `"${c}"`).join(',');

// deno-lint-ignore no-explicit-any
type Any = any;

async function monday(query: string, variables: Record<string, unknown> = {}): Promise<Any> {
  const token = Deno.env.get('MONDAY_API_TOKEN');
  if (!token) throw new Error('MONDAY_API_TOKEN não configurado');
  const res = await fetch(MONDAY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: token, 'API-Version': '2024-10' },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) throw new Error('Monday API: ' + JSON.stringify(json.errors ?? res.status));
  return json.data;
}

const ITEM_FIELDS = `id name column_values(ids: [${ROTEIRO_COLUMNS}]) { id type text value ... on BoardRelationValue { linked_item_ids } }`;

async function fetchRoteiro(): Promise<Any[]> {
  const items: Any[] = [];
  const first = await monday(`query { boards(ids: [${BOARD_ROTEIRO}]) { items_page(limit: 100) { cursor items { ${ITEM_FIELDS} } } } }`);
  let page = first.boards[0].items_page;
  items.push(...page.items);
  while (page.cursor) {
    const next = await monday(
      `query ($cursor: String!) { next_items_page(limit: 100, cursor: $cursor) { cursor items { ${ITEM_FIELDS} } } }`,
      { cursor: page.cursor },
    );
    page = next.next_items_page;
    items.push(...page.items);
  }
  return items;
}

async function fetchItemsByIds(ids: string[]): Promise<Map<string, Any>> {
  const map = new Map<string, Any>();
  for (let i = 0; i < ids.length; i += 100) {
    const chunk = ids.slice(i, i + 100);
    const data = await monday(
      `query ($ids: [ID!]) { items(ids: $ids) { id name column_values(ids: [${PRODUTO_COLUMNS}]) { id type text value } } }`,
      { ids: chunk },
    );
    for (const it of data.items) map.set(String(it.id), it);
  }
  return map;
}

// Produto "Principal" do tipo "Twin" de um Roteiro: coluna Roteiro (quadro Produto) aponta para o Roteiro,
// Coluna Tipo (color_mm90g852) = "Twin" e Status Produto = "Principal".
const BOARD_PRODUTO = 8160254865;
const PROD_ROTEIRO_COL = 'conectar_quadros_mkkwctha';
async function fetchPrincipalProduct(roteiroId: string): Promise<Any | null> {
  const rule = `{ column_id: "${PROD_ROTEIRO_COL}", compare_value: [${Number(roteiroId)}] }`;
  const data = await monday(
    `query { boards(ids: [${BOARD_PRODUTO}]) { items_page(limit: 100, query_params: { rules: [${rule}] }) { items { id name column_values(ids: [${PRODUTO_COLUMNS}]) { id type text value } } } } }`,
  );
  const items: Any[] = data.boards[0].items_page.items;
  const isTwin = (p: Any) => text(p, PROD.tipo).toLowerCase() === 'twin';
  const isPrincipal = (p: Any) => text(p, PROD.status) === 'Principal';
  return (
    items.find((p) => isTwin(p) && isPrincipal(p)) ??
    items.find((p) => isTwin(p) && !['Finalizado', 'Cancelado'].includes(text(p, PROD.status))) ??
    items.find((p) => isTwin(p)) ??
    items.find((p) => isPrincipal(p)) ??
    null
  );
}

const col = (item: Any, id: string) => item.column_values.find((c: Any) => c.id === id);
const text = (item: Any, id: string): string => (col(item, id)?.text ?? '').trim();
const parseJson = (s: string | null | undefined): Any => {
  try { return s ? JSON.parse(s) : null; } catch { return null; }
};

const slugify = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const normalizeText = (s: string) => s.replace(/\r\n/g, '\n').trim();

const MIME: Record<string, string> = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', avif: 'image/avif',
  cr2: 'image/jpeg', heic: 'image/jpeg', heif: 'image/jpeg',
};

function parseCr2Header(headBuf: ArrayBuffer): { offset: number; length: number; orientation: number } {
  const dv = new DataView(headBuf);
  if (headBuf.byteLength < 16) return { offset: 0, length: 0, orientation: 1 };
  const le = dv.getUint16(0, false) === 0x4949;
  const ifd0 = dv.getUint32(4, le);
  if (ifd0 + 2 > headBuf.byteLength) return { offset: 0, length: 0, orientation: 1 };
  const entries = dv.getUint16(ifd0, le);
  let offset = 0;
  let length = 0;
  let orientation = 1;
  for (let i = 0; i < entries; i++) {
    const pos = ifd0 + 2 + i * 12;
    if (pos + 12 > headBuf.byteLength) break;
    const tag = dv.getUint16(pos, le);
    if (tag === 0x0111) offset = dv.getUint32(pos + 8, le);
    if (tag === 0x0117) length = dv.getUint32(pos + 8, le);
    if (tag === 0x0112) orientation = dv.getUint16(pos + 8, le);
  }
  return { offset, length, orientation };
}

// Copia um arquivo do Monday (URL temporária) para o Storage público e devolve a URL permanente.
// Arquivos RAW Canon (.cr2) têm o JPEG de alta resolução extraído via HTTP Range; arquivos .heic/.heif são convertidos para .jpg.
async function mirrorAsset(sb: Any, assetId: string, folder: string): Promise<string | null> {
  const data = await monday(`query ($ids: [ID!]!) { assets(ids: $ids) { id name file_extension public_url } }`, { ids: [assetId] });
  const asset = data.assets?.[0];
  if (!asset?.public_url) return null;
  const rawExt = String(asset.file_extension || '.jpg').replace('.', '').toLowerCase();
  if (!MIME[rawExt]) return null; // ignora arquivos que não são imagem suportada
  const targetExt = ['cr2', 'heic', 'heif'].includes(rawExt) ? 'jpg' : rawExt;
  const fileName = `${assetId}.${targetExt}`;
  const path = `${folder}/${fileName}`;
  const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(path);

  const { data: listed } = await sb.storage.from(BUCKET).list(folder, { search: fileName, limit: 5 });
  if (listed?.some((f: Any) => f.name === fileName)) return pub.publicUrl; // já copiado antes

  let buf: ArrayBuffer;
  if (rawExt === 'cr2') {
    const headResp = await fetch(asset.public_url, { headers: { Range: 'bytes=0-8191' } });
    if (!headResp.ok) throw new Error(`download header CR2 ${assetId}: HTTP ${headResp.status}`);
    const { offset, length } = parseCr2Header(await headResp.arrayBuffer());
    if (!offset || !length) throw new Error(`CR2 ${assetId} sem preview JPEG embutido`);
    const jpgResp = await fetch(asset.public_url, { headers: { Range: `bytes=${offset}-${offset + length - 1}` } });
    if (!jpgResp.ok) throw new Error(`download preview CR2 ${assetId}: HTTP ${jpgResp.status}`);
    buf = await jpgResp.arrayBuffer();
  } else if (rawExt === 'heic' || rawExt === 'heif') {
    const convUrl = `https://wsrv.nl/?url=${encodeURIComponent(asset.public_url)}&output=jpg&q=85&w=2000`;
    const resp = await fetch(convUrl);
    if (!resp.ok) throw new Error(`conversão HEIC ${assetId}: HTTP ${resp.status}`);
    buf = await resp.arrayBuffer();
  } else {
    const resp = await fetch(asset.public_url);
    if (!resp.ok) throw new Error(`download do arquivo ${assetId}: HTTP ${resp.status}`);
    buf = await resp.arrayBuffer();
  }

  const { error } = await sb.storage.from(BUCKET).upload(path, buf, {
    contentType: MIME[rawExt], upsert: true, cacheControl: '31536000',
  });
  if (error) throw new Error(`upload ${path}: ${error.message}`);
  return pub.publicUrl;
}

// ── Roteiro dia a dia (quadro Itinerário) ────────────────────────────────────────────────
// Entram só os itens com a coluna "Site" marcada e ligados (coluna "Roteiro") à expedição.
// Dia/hora vêm da coluna "data" (Hr. Início) — usamos o campo `text`, que já vem no fuso da conta.
// Fotos vêm das Atrações ligadas ao item (é a origem da coluna espelho "Atrações: Foto").
const BOARD_ITINERARIO = 7720207603;
const ITIN = {
  site: 'boolean_mm81j3ke',
  roteiro: 'conectar_quadros6__1',
  dia: 'data',
  fim: 'dup__of_data_mkmnptcx',
  atracoes: 'conectar_quadros_mkmta30z',
};
const ATR_FOTO = 'file_mm1xmpax';
const MAX_FOTOS_POR_ITEM = 3;
const ITIN_FIELDS = `id name column_values(ids: ["${ITIN.site}","${ITIN.dia}","${ITIN.fim}","${ITIN.atracoes}"]) { id type text value ... on BoardRelationValue { linked_item_ids } }`;

async function fetchItinerario(expeditionId: string): Promise<Any[]> {
  const rule = `{ column_id: "${ITIN.roteiro}", compare_value: [${Number(expeditionId)}] }`;
  const items: Any[] = [];
  const first = await monday(`query { boards(ids: [${BOARD_ITINERARIO}]) { items_page(limit: 200, query_params: { rules: [${rule}] }) { cursor items { ${ITIN_FIELDS} } } } }`);
  let page = first.boards[0].items_page;
  items.push(...page.items);
  while (page.cursor) {
    const next = await monday(
      `query ($cursor: String!) { next_items_page(limit: 200, cursor: $cursor) { cursor items { ${ITIN_FIELDS} } } }`,
      { cursor: page.cursor },
    );
    page = next.next_items_page;
    items.push(...page.items);
  }
  return items;
}

// Dados das atrações (fotos já copiadas para o Storage), com cache por atração.
type AtrInfo = {
  name: string;
  tipo: string;
  stars: number | null;
  site: string | null;
  description: string | null;
  distances: string[];
  photos: string[];
};
const ATR_COLS = {
  foto: ATR_FOTO,
  tipo: 'label_mkmt7614',
  estrelas: 'avalia__o_mkn46hc8',
  site: 'link_mknbkt85',
  descSite: 'long_text_mm8xpgk1',
  comentario: 'texto_longo_mkn44j6x',
  distancias: 'lista_suspensa_mkmvxfs7',
};
const ATR_COL_LIST = Object.values(ATR_COLS).map((c) => `"${c}"`).join(',');

async function attractionPhotos(sb: Any, ids: string[], cache: Map<string, AtrInfo>, summary: Any): Promise<void> {
  const missing = ids.filter((i) => !cache.has(i));
  for (let i = 0; i < missing.length; i += 100) {
    const chunk = missing.slice(i, i + 100);
    const data = await monday(
      `query ($ids: [ID!]) { items(ids: $ids) { id name column_values(ids: [${ATR_COL_LIST}]) { id text value } } }`,
      { ids: chunk },
    );
    for (const it of data.items) {
      const files = parseJson(col(it, ATR_COLS.foto)?.value)?.files ?? [];
      const urls: string[] = [];
      for (const f of files) {
        if (urls.length >= MAX_FOTOS_POR_ITEM) break;
        if (!f?.assetId) continue;
        try {
          const url = await mirrorAsset(sb, String(f.assetId), 'atracoes');
          if (url) { urls.push(url); summary.images++; }
        } catch (e) {
          summary.errors.push({ etapa: 'foto-atracao', atracao: it.id, erro: String((e as Error).message ?? e) });
        }
      }
      const stars = parseInt(text(it, ATR_COLS.estrelas), 10);
      const siteUrl = (parseJson(col(it, ATR_COLS.site)?.value)?.url ?? '').trim() || text(it, ATR_COLS.site);
      const desc = normalizeText(text(it, ATR_COLS.descSite)) || normalizeText(text(it, ATR_COLS.comentario)) || null;
      const distances = text(it, ATR_COLS.distancias).split(',').map((s) => s.trim()).filter(Boolean);
      cache.set(String(it.id), {
        name: it.name,
        tipo: text(it, ATR_COLS.tipo),
        stars: Number.isFinite(stars) && stars > 0 ? stars : null,
        site: siteUrl || null,
        description: desc,
        distances,
        photos: urls,
      });
    }
    for (const id of chunk) {
      if (!cache.has(id)) {
        cache.set(id, { name: '', tipo: '', stars: null, site: null, description: null, distances: [], photos: [] });
      }
    }
  }
}

const dayNumber = (isoDate: string, startDate: string) =>
  Math.round((Date.parse(isoDate + 'T00:00:00Z') - Date.parse(startDate + 'T00:00:00Z')) / 86400000) + 1;

async function syncDays(
  sb: Any,
  expeditionId: string,
  startDate: string,
  roteiroAtrIds: string[],
  raceLogoUrl: string | null,
  summary: Any,
  photoCache: Map<string, AtrInfo>,
): Promise<number> {
  const all = await fetchItinerario(expeditionId);
  const marked = all.filter((it) => {
    const v = parseJson(col(it, ITIN.site)?.value)?.checked;
    return v === true || v === 'true';
  });

  const atrIds = new Set<string>(roteiroAtrIds.map(String));
  for (const it of all) for (const a of col(it, ITIN.atracoes)?.linked_item_ids ?? []) atrIds.add(String(a));
  if (atrIds.size) await attractionPhotos(sb, [...atrIds], photoCache, summary);

  const rows: Any[] = [];
  for (const it of marked) {
    const dia = text(it, ITIN.dia); // "2026-12-03" ou "2026-12-03 14:00"
    const m = dia.match(/^(\d{4}-\d{2}-\d{2})(?:\s+(\d{2}:\d{2}))?/);
    if (!m) { summary.skipped.push({ id: String(it.id), name: it.name, motivo: 'item do Itinerário sem data' }); continue; }
    const fim = text(it, ITIN.fim).match(/^\d{4}-\d{2}-\d{2}\s+(\d{2}:\d{2})/);
    const photos: string[] = [];
    for (const a of col(it, ITIN.atracoes)?.linked_item_ids ?? []) {
      for (const u of photoCache.get(String(a))?.photos ?? []) if (!photos.includes(u)) photos.push(u);
    }
    rows.push({
      id: `${expeditionId}-${it.id}`,
      expedition_id: expeditionId,
      monday_item_id: String(it.id),
      day_date: m[1],
      day_number: dayNumber(m[1], startDate),
      title: it.name,
      description: null,
      is_included: true,
      start_time: m[2] ?? null,
      end_time: fim ? fim[1] : null,
      photos: photos.slice(0, MAX_FOTOS_POR_ITEM),
    });
  }

  // Hospedagens: atrações do tipo "Hospedagem" ligadas aos itens marcados, na ordem em que aparecem no roteiro
  const stays: Any[] = [];
  const seenStay = new Set<string>();
  const byDate = [...marked].sort((a, b) => text(a, ITIN.dia).localeCompare(text(b, ITIN.dia)));
  for (const it of byDate) {
    for (const a of col(it, ITIN.atracoes)?.linked_item_ids ?? []) {
      const info = photoCache.get(String(a));
      if (!info || info.tipo !== 'Hospedagem' || seenStay.has(String(a))) continue;
      seenStay.add(String(a));
      stays.push({ name: info.name, stars: info.stars, website: info.site, photos: info.photos });
    }
  }

  // Provas de Corrida: atrações do tipo "Prova de Corrida" (exceto itens de "Expo ...") ligadas ao Roteiro ou ao Itinerário
  const raceCandidateIds: string[] = [...roteiroAtrIds.map(String)];
  const allByDate = [...all].sort((a, b) => text(a, ITIN.dia).localeCompare(text(b, ITIN.dia)));
  for (const it of allByDate) {
    for (const a of col(it, ITIN.atracoes)?.linked_item_ids ?? []) raceCandidateIds.push(String(a));
  }
  const rawRaces: Any[] = [];
  const seenRace = new Set<string>();
  for (const aId of raceCandidateIds) {
    if (seenRace.has(aId)) continue;
    const info = photoCache.get(aId);
    if (!info || info.tipo !== 'Prova de Corrida') continue;
    if (/^expo\b/i.test(info.name.trim())) continue;
    seenRace.add(aId);
    rawRaces.push({
      id: aId,
      name: info.name,
      website: info.site,
      description: info.description,
      distances: info.distances,
      photos: info.photos,
    });
  }
  const hasRichRace = rawRaces.some((r) => (r.photos && r.photos.length > 0) || r.description || r.website);
  const races = hasRichRace ? rawRaces.filter((r) => (r.photos && r.photos.length > 0) || r.description || r.website) : rawRaces.slice(0, 1);
  if (raceLogoUrl) {
    if (races.length > 0) {
      races[0] = {
        ...races[0],
        logo: raceLogoUrl,
        photos: [raceLogoUrl, ...(races[0].photos ?? []).filter((u: string) => u !== raceLogoUrl)],
      };
    } else {
      races.push({
        id: `${expeditionId}-race`,
        name: 'Prova de Corrida',
        logo: raceLogoUrl,
        photos: [raceLogoUrl],
      });
    }
  }

  const { error: stayErr } = await sb.from('expeditions').update({ stays, races }).eq('id', expeditionId);
  if (stayErr) throw new Error('gravar hospedagens/provas: ' + stayErr.message);

  // Grava os atuais e remove os que saíram do Monday / foram desmarcados (inclui dados antigos sem monday_item_id)
  if (rows.length) {
    const mondayIds = rows.map((r) => r.monday_item_id);
    // Se um item do Itinerário mudou de expedição no Monday (ex.: Pipa 26 -> Pipa 27),
    // remove o vínculo antigo antes do upsert para não violar expedition_days_monday_item_id_key.
    await sb.from('expedition_days').delete().in('monday_item_id', mondayIds).neq('expedition_id', expeditionId);
    const { error } = await sb.from('expedition_days').upsert(rows, { onConflict: 'id' });
    if (error) throw new Error('upsert expedition_days: ' + error.message);
  }
  const keep = rows.map((r) => r.id);
  let del = sb.from('expedition_days').delete().eq('expedition_id', expeditionId);
  if (keep.length) del = del.not('id', 'in', `(${keep.map((k) => `"${k}"`).join(',')})`);
  const { error: delErr } = await del;
  if (delErr) throw new Error('limpar expedition_days: ' + delErr.message);
  return rows.length;
}

// ── Textos fixos do site (quadro "Site") ─────────────────────────────────────────────────
// Nome do item = chave usada no site; coluna "Texto" = o texto. Itens sem texto são ignorados
// (o site usa o texto padrão embutido). Chaves removidas do quadro saem da tabela.
const BOARD_TEXTOS = 18434998880;
const TEXTO_COL = 'long_text_mm81kyv2';
const TEXTO_IMG_COL = 'file_mm8xw9y9';

async function uploadFileToMondayColumn(itemId: string, columnId: string, fileUrl: string, fileName: string): Promise<string | null> {
  const token = Deno.env.get('MONDAY_API_TOKEN');
  if (!token) return null;
  const imgResp = await fetch(fileUrl);
  if (!imgResp.ok) return null;
  const blob = await imgResp.blob();
  const form = new FormData();
  form.append('query', `mutation ($file: File!) { add_file_to_column (item_id: ${Number(itemId)}, column_id: "${columnId}", file: $file) { id } }`);
  form.append('variables[file]', new File([blob], fileName, { type: blob.type || 'image/jpeg' }));
  const res = await fetch('https://api.monday.com/v2/file', {
    method: 'POST',
    headers: { Authorization: token, 'API-Version': '2024-10' },
    body: form,
  });
  const json = await res.json();
  return json?.data?.add_file_to_column?.id ? String(json.data.add_file_to_column.id) : null;
}

async function syncSiteTexts(sb: Any): Promise<Any> {
  const fields = `id name column_values(ids: ["${TEXTO_COL}","${TEXTO_IMG_COL}"]) { id text value ... on FileValue { files { ... on FileAssetValue { name asset_id } } } }`;
  const items: Any[] = [];
  const first = await monday(`query { boards(ids: [${BOARD_TEXTOS}]) { items_page(limit: 500) { cursor items { ${fields} } } } }`);
  let page = first.boards[0].items_page;
  items.push(...page.items);
  while (page.cursor) {
    const next = await monday(
      `query ($cursor: String!) { next_items_page(limit: 500, cursor: $cursor) { cursor items { ${fields} } } }`,
      { cursor: page.cursor },
    );
    page = next.next_items_page;
    items.push(...page.items);
  }

  const rows: { key: string; value: string; updated_at: string }[] = [];
  const now = new Date().toISOString();
  for (const it of items) {
    const key = String(it.name ?? '').trim();
    if (!/^[a-z0-9_]+$/.test(key)) continue;
    const textCol = it.column_values?.find((c: Any) => c.id === TEXTO_COL);
    const imgCol = it.column_values?.find((c: Any) => c.id === TEXTO_IMG_COL);
    let value = String(textCol?.text ?? '').replace(/\r\n/g, '\n').trim();
    const jsonFiles: Any[] = parseJson(imgCol?.value)?.files ?? [];
    const gqlFiles: Any[] = imgCol?.files ?? [];
    const rawFiles = jsonFiles.length ? jsonFiles : gqlFiles;
    const sortedFiles = [...rawFiles].sort((a: Any, b: Any) =>
      String(a?.name ?? '').localeCompare(String(b?.name ?? ''), 'pt-BR', { numeric: true }),
    );
    const assetIds: string[] = sortedFiles
      .map((f: Any) => String(f?.assetId ?? f?.asset_id ?? '').trim())
      .filter(Boolean);

    // Se for o item de foto da seção "Perfil dos viajantes" (para_quem_foto) e ainda não houver arquivo na coluna Imagem,
    // anexa automaticamente a foto hero.jpg na coluna Imagem do Monday e limpa a coluna Texto.
    if (!assetIds.length && key === 'para_quem_foto') {
      try {
        const uploadedId = await uploadFileToMondayColumn(String(it.id), TEXTO_IMG_COL, 'https://jtviajarcorrer.pages.dev/hero.jpg', 'hero.jpg');
        if (uploadedId) {
          assetIds.push(uploadedId);
          await monday(
            `mutation ($boardId: ID!, $itemId: ID!, $vals: JSON!) { change_multiple_column_values(board_id: $boardId, item_id: $itemId, column_values: $vals) { id } }`,
            {
              boardId: String(BOARD_TEXTOS),
              itemId: String(it.id),
              vals: JSON.stringify({
                [TEXTO_COL]: { text: '' },
                text_mm81cm9z: 'Home - Perfil dos Viajantes - Foto abaixo do texto (anexada na coluna Imagem)',
              }),
            },
          );
        }
      } catch {
        // ignora erro de seed inicial
      }
    }

    if (assetIds.length) {
      const mirroredUrls: string[] = [];
      for (const aid of assetIds) {
        try {
          const mirrored = await mirrorAsset(sb, String(aid), 'site');
          if (mirrored) mirroredUrls.push(mirrored);
        } catch {
          // ignora erro individual
        }
      }
      if (mirroredUrls.length) {
        value = mirroredUrls.join('\n');
      }
    }
    if (!value) continue; // só chaves válidas e com texto/imagem
    rows.push({ key, value, updated_at: now });
  }

  if (rows.length) {
    const { error } = await sb.from('site_texts').upsert(rows, { onConflict: 'key' });
    if (error) throw new Error('upsert site_texts: ' + error.message);
  }
  // Remove chaves que não existem mais (ou ficaram vazias) no Monday
  const keep = rows.map((r) => r.key);
  let del = sb.from('site_texts').delete();
  del = keep.length ? del.not('key', 'in', `(${keep.map((k) => `"${k}"`).join(',')})`) : del.neq('key', '');
  const { error: delErr } = await del;
  if (delErr) throw new Error('limpar site_texts: ' + delErr.message);
  return { synced: rows.length, ignored: items.length - rows.length };
}

Deno.serve(async (req: Request) => {
  const secret = Deno.env.get('SYNC_SECRET');
  if (!secret || req.headers.get('x-sync-secret') !== secret) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const summary: Any = { synced: [], inserted: 0, updated: 0, hidden: 0, skipped: [], errors: [], images: 0 };

  try {
    // 1) Lê o Roteiro inteiro. Se falhar, aborta sem tocar no banco.
    const roteiro = await fetchRoteiro();
    const featured = roteiro.filter((it) => parseJson(col(it, COL.destaque)?.value)?.checked === true);

    // 2) Destinos e Produtos ligados aos itens em destaque
    const linkedIds = new Set<string>();
    for (const it of featured) {
      for (const id of col(it, COL.destino)?.linked_item_ids ?? []) linkedIds.add(String(id));
      for (const id of col(it, COL.produto)?.linked_item_ids ?? []) linkedIds.add(String(id));
    }
    const linked = linkedIds.size ? await fetchItemsByIds([...linkedIds]) : new Map<string, Any>();

    // 3) Quais já existem no banco
    const featuredIds = featured.map((it) => String(it.id));
    const { data: existingRows, error: exErr } = await sb.from('expeditions').select('id').in('id', featuredIds.length ? featuredIds : ['-']);
    if (exErr) throw new Error('select expeditions: ' + exErr.message);
    const existing = new Set((existingRows ?? []).map((r: Any) => r.id));
    const usedSlugs = new Set<string>();
    const photoCache = new Map<string, AtrInfo>(); // id da atração -> dados + URLs já copiadas

    for (const it of featured) {
      const id = String(it.id);
      try {
        const cron = parseJson(col(it, COL.cronograma)?.value);
        if (!cron?.from || !cron?.to) {
          summary.skipped.push({ id, name: it.name, motivo: 'sem Cronograma (início/fim)' });
          continue;
        }

        const destinoItem = linked.get(String((col(it, COL.destino)?.linked_item_ids ?? [])[0]));
        const name = destinoItem?.name || it.name;
        let slug = `${slugify(name)}-${String(cron.from).slice(0, 4)}`;
        if (usedSlugs.has(slug)) slug = `${slug}-${id}`;
        usedSlugs.add(slug);

        // Preço "a partir de" = menor Vlr. à Vista entre os produtos do tipo Twin ainda ativos (senão, entre todos os Twin / ativos)
        const produtos = (col(it, COL.produto)?.linked_item_ids ?? []).map((p: Any) => linked.get(String(p))).filter(Boolean);
        const produtosTwin = produtos.filter((p: Any) => text(p, PROD.tipo).toLowerCase() === 'twin');
        const baseProdutos = produtosTwin.length ? produtosTwin : produtos;
        const comPreco = baseProdutos
          .map((p: Any) => ({ p, preco: parseFloat(text(p, PROD.aVista)) }))
          .filter((x: Any) => x.preco > 0);
        const ativos = comPreco.filter((x: Any) => !['Finalizado', 'Cancelado'].includes(text(x.p, PROD.status)));
        const pool = (ativos.length ? ativos : comPreco).sort((a: Any, b: Any) => a.preco - b.preco);
        const maisBarato = pool[0];

        // O que está incluso / não incluso e valores: produto do tipo "Twin" (color_mm90g852) ligado a este Roteiro
        const principal =
          (await fetchPrincipalProduct(id)) ??
          produtosTwin.find((p: Any) => text(p, PROD.status) === 'Principal') ??
          produtosTwin[0] ??
          null;
        const incluso = principal ? normalizeText(text(principal, PROD.incluso)) : '';
        const naoIncluso = principal ? normalizeText(text(principal, PROD.siteNaoIncluso)) : '';
        if (!principal) summary.skipped.push({ id, name, motivo: 'sem produto Principal — incluso/não incluso/parcelamento ficam vazios' });

        // Valor: à vista (Vlr. À Vista) e parcelamento (Entrada, Qt Max Parcelas, Vlr Parcela) do produto Principal.
        // Sem Principal, o "à vista" cai na regra antiga (menor valor entre os produtos ativos) e não há parcelamento.
        const num = (p: Any, c: string) => { const n = parseFloat(text(p, c)); return Number.isFinite(n) && n > 0 ? n : null; };
        const aVistaPrincipal = principal ? num(principal, PROD.aVista) : null;
        const precoAVista = aVistaPrincipal ?? (maisBarato ? maisBarato.preco : null);
        const maxParcelas = principal ? num(principal, PROD.maxParcelas) : null;
        const valorParcela = principal ? num(principal, PROD.valorParcela) : null;
        const parcelado = maxParcelas && valorParcela
          ? { entrada: principal ? num(principal, PROD.entrada) : null, maxParcelas: Math.round(maxParcelas), valorParcela }
          : null;

        const vagasTotais = parseInt(text(it, COL.vagas), 10);
        const hoje = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
        const modalities = text(it, COL.distancias).split(',').map((s) => s.trim()).filter(Boolean);

        // deno-lint-ignore no-explicit-any
        const row: Record<string, any> = {
          slug,
          name,
          monday_name: it.name,
          status: cron.to < hoje ? 'Encerrada' : (vagasTotais === 0 ? 'Esgotado' : 'Vagas Abertas'),
          start_date: cron.from,
          end_date: cron.to,
          modalities,
          price: precoAVista,
          installment_entry: parcelado?.entrada ?? null,
          installment_max: parcelado?.maxParcelas ?? null,
          installment_value: parcelado?.valorParcela ?? null,
          spots_total: Number.isFinite(vagasTotais) ? vagasTotais : null,
          ...(Number.isFinite(vagasTotais) ? { spots_left: vagasTotais } : {}),
          highlight: true,
          slogan: text(it, COL.slogan) || null,
          description: normalizeText(text(it, COL.descricao)) || null,
          included: incluso || null,
          not_included: naoIncluso || null,
          monday_item_id: id,
          updated_at: new Date().toISOString(),
        };

        // Fotos: só sobrescreve se o Monday tiver fotos (primeira = capa, todas = galeria)
        const files = parseJson(col(it, COL.fotos)?.value)?.files ?? [];
        const urls: string[] = [];
        for (const f of files) {
          if (!f?.assetId) continue;
          try {
            const url = await mirrorAsset(sb, String(f.assetId), id);
            if (url) { urls.push(url); summary.images++; }
          } catch (e) {
            summary.errors.push({ id, name, etapa: 'foto', erro: String((e as Error).message ?? e) });
          }
        }
        if (urls.length) { row.cover_image = urls[0]; row.gallery_images = urls; }

        // Capa/fundo da expedição (cards e página): mesma fonte do ADV — quadro Destinos, coluna file_mm1ww2gr.
        // Tem prioridade sobre as fotos do Roteiro; se o Destino não tiver capa, vale a primeira foto do Roteiro.
        const capaFile = parseJson(col(destinoItem ?? { column_values: [] }, PROD.destinoCapa)?.value)?.files?.[0];
        if (capaFile?.assetId) {
          try {
            const capa = await mirrorAsset(sb, String(capaFile.assetId), `destinos/${destinoItem.id}`);
            if (capa) { row.cover_image = capa; summary.images++; }
          } catch (e) {
            summary.errors.push({ id, name, etapa: 'capa do destino', erro: String((e as Error).message ?? e) });
          }
        }

        if (existing.has(id)) {
          const { error } = await sb.from('expeditions').update(row).eq('id', id);
          if (error) throw new Error('update: ' + error.message);
          summary.updated++;
        } else {
          row.id = id;
          row.spots_left = row.spots_total; // vagas restantes: valor inicial; o Monday não informa
          const { error } = await sb.from('expeditions').insert(row);
          if (error) throw new Error('insert: ' + error.message);
          summary.inserted++;
        }
        summary.synced.push({ id, name, slug });

        // Roteiro dia a dia (quadro Itinerário) — falha aqui não derruba a expedição
        try {
          let raceLogoUrl: string | null = null;
          const logoFile = parseJson(col(it, COL.logoProva)?.value)?.files?.[0];
          if (logoFile?.assetId) {
            try {
              raceLogoUrl = await mirrorAsset(sb, String(logoFile.assetId), `${id}/logo`);
              if (raceLogoUrl) summary.images++;
            } catch (e) {
              summary.errors.push({ id, name, etapa: 'logo da prova', erro: String((e as Error).message ?? e) });
            }
          }
          const roteiroAtrIds = (col(it, COL.atracoes)?.linked_item_ids ?? []).map(String);
          const n = await syncDays(sb, id, cron.from, roteiroAtrIds, raceLogoUrl, summary, photoCache);
          summary.days = (summary.days ?? 0) + n;
        } catch (e) {
          summary.errors.push({ id, name, etapa: 'roteiro', erro: String((e as Error).message ?? e) });
        }
      } catch (e) {
        summary.errors.push({ id, name: it.name, erro: String((e as Error).message ?? e) });
      }
    }

    // 4) Quem foi desmarcado no Monday some do site (highlight = false), sem apagar o registro
    const { data: visible } = await sb.from('expeditions').select('id, monday_item_id').eq('highlight', true);
    const toHide = (visible ?? []).filter((r: Any) => !featuredIds.includes(String(r.monday_item_id ?? r.id))).map((r: Any) => r.id);
    if (toHide.length) {
      const { error } = await sb.from('expeditions').update({ highlight: false, updated_at: new Date().toISOString() }).in('id', toHide);
      if (error) summary.errors.push({ etapa: 'ocultar', erro: error.message });
      else summary.hidden = toHide.length;
    }

    // 5) Textos fixos do site (quadro "Site")
    try {
      summary.texts = await syncSiteTexts(sb);
    } catch (e) {
      summary.errors.push({ etapa: 'textos', erro: String((e as Error).message ?? e) });
    }

    return new Response(JSON.stringify({ ok: summary.errors.length === 0, ...summary }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[sync-monday] falha:', e);
    return new Response(JSON.stringify({ ok: false, error: String((e as Error).message ?? e), ...summary }), {
      status: 502, headers: { 'Content-Type': 'application/json' },
    });
  }
});
