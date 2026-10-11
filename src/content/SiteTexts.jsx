// Textos fixos do site, gerenciados pelo time no Monday (quadro "Site").
//   - Nome do item = chave (ex.: hero_frase); coluna "Texto" = texto exibido.
//   - O sync-monday copia o quadro para a tabela public.site_texts (Supabase); o site lê de lá.
//   - Os textos padrão (siteTexts.json) aparecem na hora e quando uma chave não existir/estiver vazia no Monday,
//     então o site nunca fica sem texto e nunca espera a rede para renderizar.
//
// Convenções de escrita no Monday:
//   [[trecho]]   -> trecho em destaque (cor definida no site)
//   {variavel}   -> valor dinâmico (ex.: {vagas}, {parcelas}); a dica "Onde aparece" informa quais existem
import { createContext, useContext, useEffect, useMemo, useState, Fragment } from 'react';
import { supabase } from '../supabaseClient.js';
import catalog from './siteTexts.json';

const DEFAULTS = Object.fromEntries(catalog.map((i) => [i.key, i.text]));
const CACHE_KEY = 'jt_site_texts_v1';

const readCache = () => {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || {}; } catch { return {}; }
};

const fill = (str, vars) =>
  vars ? str.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined && vars[k] !== null ? String(vars[k]) : m)) : str;

function makeApi(remote) {
  const raw = (key) => {
    const v = remote[key];
    return typeof v === 'string' && v.trim() ? v : (DEFAULTS[key] ?? key);
  };
  /** Texto simples (com variáveis). Trechos [[ ]] aparecem sem destaque. */
  const t = (key, vars) => fill(raw(key), vars).replace(/\[\[(.+?)\]\]/g, '$1');
  /** Texto com destaques: o n-ésimo [[trecho]] usa colors[n] (string = cor; objeto = estilo completo). */
  const rich = (key, colors = [], vars) => {
    const parts = fill(raw(key), vars).split(/\[\[(.+?)\]\]/g);
    let n = 0;
    return parts.map((part, i) => {
      if (i % 2 === 0) return <Fragment key={i}>{part}</Fragment>;
      const c = colors.length ? colors[n++ % colors.length] : undefined;
      const style = typeof c === 'string' ? { color: c } : c;
      return <span key={i} style={style}>{part}</span>;
    });
  };
  return { t, rich };
}

const Ctx = createContext(makeApi({}));

export function SiteTextsProvider({ children }) {
  const [remote, setRemote] = useState(readCache);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data, error } = await supabase.from('site_texts').select('key, value');
      if (!alive || error || !data) return;
      const map = {};
      for (const r of data) if (typeof r.value === 'string' && r.value.trim()) map[r.key] = r.value;
      setRemote(map);
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(map)); } catch { /* sem cache */ }
    })();
    return () => { alive = false; };
  }, []);

  const api = useMemo(() => makeApi(remote), [remote]);
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export const useT = () => useContext(Ctx);
