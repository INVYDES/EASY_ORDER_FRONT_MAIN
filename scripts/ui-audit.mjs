#!/usr/bin/env node
/**
 * Auditor de layout responsive (móvil / tablet / escritorio).
 *
 * Levanta un Vite temporal, mide las páginas públicas con Chrome headless vía
 * DevTools Protocol y falla (exit 1) si detecta:
 *   - scroll horizontal de página
 *   - elementos que se salen de su contenedor
 *   - objetivos táctiles menores a 44px de alto
 *   - elementos enfocables sin indicador de foco visible
 *   - controles enfocables sin nombre accesible
 *   - elementos enfocables dentro de un contenedor aria-hidden
 *
 * Uso:
 *   npm run check:ui
 *   npm run check:ui -- --only tablet      (mobile | tablet | desktop | a11y)
 *   npm run check:ui -- --skip-a11y        (solo layout)
 *   npm run check:ui -- --base http://localhost:5173   (usa un server ya levantado)
 *   npm run check:ui -- --verbose
 *
 * Requiere Node 22+ (usa WebSocket global) y Chrome instalado
 * (o la variable de entorno CHROME_PATH).
 */
import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as sleep } from 'node:timers/promises'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const argVal = (name, fallback = null) => {
  const i = args.indexOf(name)
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback
}
const ONLY = argVal('--only')
const VERBOSE = args.includes('--verbose')
const MIN_TAP = 44
const RUN_A11Y = !args.includes('--skip-a11y')
const MAX_TABS = 40

const ROUTES = [
  { path: '/', sel: '.landing', label: 'landing' },
  { path: '/planes', sel: '.planes-page', label: 'planes' },
]

const VIEWPORTS = [
  { group: 'mobile', name: '360x640', width: 360, height: 640, menuBreak: 900 },
  { group: 'mobile', name: '390x844', width: 390, height: 844, menuBreak: 900 },
  { group: 'tablet', name: '768x1024', width: 768, height: 1024, menuBreak: 900 },
  { group: 'tablet', name: '1024x1366', width: 1024, height: 1366, menuBreak: 900 },
  { group: 'desktop', name: '1440x900', width: 1440, height: 900, menuBreak: 900 },
  { group: 'desktop', name: '1920x1080', width: 1920, height: 1080, menuBreak: 900 },
].filter((vp) => !ONLY || vp.group === ONLY)

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean)

const AUDIT = `(() => {
  const vw = document.documentElement.clientWidth;
  const clippedByAncestor = (el) => {
    let p = el.parentElement;
    while (p && p !== document.body) {
      const ox = getComputedStyle(p).overflowX;
      if (ox === 'auto' || ox === 'scroll' || ox === 'hidden') return true;
      p = p.parentElement;
    }
    return false;
  };
  const offenders = [];
  for (const el of document.querySelectorAll('#app *')) {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    if (r.right <= vw + 1 && r.left >= -1) continue;
    const cls = typeof el.className === 'string' ? el.className : '';
    offenders.push({
      tag: el.tagName.toLowerCase(),
      cls: cls.slice(0, 40),
      text: (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 30),
      w: Math.round(r.width),
      clipped: clippedByAncestor(el),
    });
  }
  const taps = [];
  for (const el of document.querySelectorAll('#app a, #app button')) {
    const r = el.getBoundingClientRect();
    if (r.height < 1) continue;
    if (r.height < ${MIN_TAP}) {
      const cls = typeof el.className === 'string' ? el.className : '';
      taps.push({
        cls: cls.slice(0, 34) || '(sin clase)',
        text: (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 24),
        w: +r.width.toFixed(1),
        h: +r.height.toFixed(1),
      });
    }
  }
  const visible = (el) => !!el && getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().width > 0;
  const img = document.querySelector('.planes-figure img, .plans-media img');
  return JSON.stringify({
    vw,
    docScrollW: document.documentElement.scrollWidth,
    hScroll: document.documentElement.scrollWidth > vw + 1,
    unclipped: offenders.filter((o) => !o.clipped),
    navLinksVisible: visible(document.querySelector('.nav-links')),
    menuBtnVisible: visible(document.querySelector('.menu-btn')),
    taps: taps.slice(0, 12),
    tapCount: taps.length,
    imgUpscaled: img ? img.getBoundingClientRect().width > img.naturalWidth + 1 : false,
    imgW: img ? Math.round(img.getBoundingClientRect().width) : null,
    imgNatural: img ? img.naturalWidth : null,
  });
})()`

function findChrome() {
  const found = CHROME_CANDIDATES.find((p) => p === 'chrome' || existsSync(p))
  if (!found) {
    console.error('No encontré Chrome. Instálalo o define CHROME_PATH.')
    process.exit(2)
  }
  return found
}

async function reachable(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(1500) })
    return res.ok || res.status < 500
  } catch {
    return false
  }
}

async function freePort(start) {
  for (let port = start; port < start + 12; port++) {
    if (!(await reachable(`http://localhost:${port}/`))) return port
  }
  throw new Error('No hay puerto libre')
}

function connect(url) {
  const ws = new WebSocket(url)
  const pending = new Map()
  let id = 0
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data)
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg)
      pending.delete(msg.id)
    }
  })
  const ready = new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve)
    ws.addEventListener('error', reject)
  })
  const send = (method, params = {}) => {
    const msgId = ++id
    ws.send(JSON.stringify({ id: msgId, method, params }))
    return new Promise((resolve, reject) =>
      pending.set(msgId, (msg) =>
        msg.error ? reject(new Error(`${method}: ${JSON.stringify(msg.error)}`)) : resolve(msg.result),
      ),
    )
  }
  return { ws, ready, send, close: () => ws.close() }
}

const cleanup = []
function shutdown(signal) {
  for (const fn of cleanup) {
    try {
      fn()
    } catch {}
  }
  if (signal) process.exit(signal === 'SIGINT' ? 130 : 1)
}
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

// --- Server ---
let server = null
let BASE = argVal('--base')
if (BASE) {
  console.log(`Usando server existente: ${BASE}`)
} else {
  if (!(await reachable('http://localhost:5173/'))) {
    const port = await freePort(5199)
    const log = []
    server = spawn(process.execPath, [join(ROOT, 'node_modules/vite/bin/vite.js'), '--port', String(port)], {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    server.stdout.on('data', (d) => log.push(String(d)))
    server.stderr.on('data', (d) => log.push(String(d)))
    cleanup.push(() => server.kill())
    BASE = `http://localhost:${port}`
    let up = false
    for (let i = 0; i < 40; i++) {
      if (await reachable(BASE + '/')) {
        up = true
        break
      }
      await sleep(500)
    }
    if (!up) {
      console.error('Vite no arrancó:\n' + log.join(''))
      shutdown()
    }
    console.log(`Vite temporal en ${BASE}`)
  } else {
    BASE = 'http://localhost:5173'
    console.log(`Usando el dev server que ya está corriendo: ${BASE}`)
  }
}

// --- Chrome ---
const profile = mkdtempSync(join(tmpdir(), 'ui-audit-'))
const cdpPort = await freePort(9320)
const chrome = spawn(
  findChrome(),
  [
    '--headless=new',
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--hide-scrollbars',
    'about:blank',
  ],
  { stdio: 'ignore' },
)
cleanup.push(() => {
  chrome.kill()
  try {
    rmSync(profile, { recursive: true, force: true })
  } catch {}
})

async function targetUrl() {
  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${cdpPort}/json/list`)).json()
      const page = list.find((t) => t.type === 'page')
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl
    } catch {}
    await sleep(250)
  }
  throw new Error('Chrome no expuso target CDP')
}

const { ws, ready, send } = connect(await targetUrl())
await ready
await send('Page.enable')
await send('Runtime.enable')

async function waitFor(sel, tries = 120) {
  for (let i = 0; i < tries; i++) {
    const res = await send('Runtime.evaluate', { expression: `!!document.querySelector('${sel}')`, returnByValue: true })
    if (res.result?.value) return true
    await sleep(250)
  }
  return false
}

// Calentamiento: deja que Vite compile las rutas lazy.
for (const route of ROUTES) {
  await send('Emulation.setDeviceMetricsOverride', { width: 1024, height: 1366, deviceScaleFactor: 1, mobile: false })
  await send('Page.navigate', { url: BASE + route.path })
  const ok = await waitFor(route.sel)
  if (!ok) console.error(`  (aviso) ${route.path} no montó en el calentamiento`)
}

// --- Medición ---
const failures = []
let cases = 0

for (const vp of VIEWPORTS) {
  console.log(`\n${vp.group.toUpperCase()}`)
  for (const route of ROUTES) {
    cases++
    await send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: vp.width <= 1024 ? 2 : 1,
      mobile: vp.width <= 1024,
    })
    await send('Page.navigate', { url: BASE + route.path })
    await waitFor(route.sel)
    await sleep(600)
    const res = await send('Runtime.evaluate', { expression: AUDIT, returnByValue: true })
    const d = JSON.parse(res.result.value)

    const problems = []
    if (!d.hScroll && !d.unclipped.length && !d.tapCount) problems.push('ok')
    if (d.hScroll) problems.push(`scroll horizontal (docScrollW ${d.docScrollW} > vw ${d.vw})`)
    if (d.unclipped.length) problems.push(`${d.unclipped.length} elemento(s) fuera de contenedor`)
    if (d.tapCount) problems.push(`${d.tapCount} tap target(s) < ${MIN_TAP}px`)
    if (d.imgUpscaled) problems.push(`imagen escalada hacia arriba (${d.imgW}px de ${d.imgNatural}px)`)

    const failed = problems[0] !== 'ok'
    if (failed) {
      failures.push({ vp, route, problems, d })
      console.log(`  ✘ ${vp.name.padEnd(10)} ${route.label.padEnd(8)} ${problems.join(' · ')}`)
      for (const o of d.unclipped.slice(0, 5)) {
        console.log(`      fuera de contenedor: <${o.tag} class="${o.cls}"> "${o.text}" (${o.w}px)`)
      }
      for (const t of d.taps.slice(0, 8)) {
        console.log(`      tap target: [${t.cls}] "${t.text}" ${t.w}x${t.h}`)
      }
    } else {
      console.log(`  ✔ ${vp.name.padEnd(10)} ${route.label.padEnd(8)} sin overflow · nav ${d.navLinksVisible ? 'links' : 'hamburguesa'} · 0 taps<${MIN_TAP}`)
    }
    if (VERBOSE) {
      console.log(
        `      nav=${d.navLinksVisible ? 'links' : 'hamburguesa'} menuBtn=${d.menuBtnVisible ? 'sí' : 'no'} img=${d.imgW ?? '-'}/${d.imgNatural ?? '-'}`,
      )
    }
  }
}

/* ---------- Fase 2: accesibilidad de teclado ---------- */

const A11Y_VIEWPORTS = [
  { name: '390x844', width: 390, height: 844, mobile: true },
  { name: '1440x900', width: 1440, height: 900, mobile: false },
]

const FOCUS_INFO = `(() => {
  const el = document.activeElement;
  if (!el) return JSON.stringify(null);
  const name = (el.getAttribute('aria-label') || el.getAttribute('alt') || el.getAttribute('title') || (el.textContent || '').trim().replace(/\\s+/g, ' ')).slice(0, 34);
  const r = el.getBoundingClientRect();
  const styleOf = (e) => { const cs = getComputedStyle(e); return [cs.outlineStyle, cs.outlineWidth, cs.outlineColor, cs.boxShadow, cs.backgroundColor, cs.borderColor].join('|'); };
  const conFoco = styleOf(el);
  el.blur();
  const sinFoco = styleOf(el);
  el.focus();
  const yaVisitado = el.dataset.a11ySeen === '1';
  el.dataset.a11ySeen = '1';
  const cls = typeof el.className === 'string' ? el.className : '';
  return JSON.stringify({
    tag: el.tagName.toLowerCase(),
    cls: cls.slice(0, 30),
    name,
    w: Math.round(r.width),
    h: Math.round(r.height),
    yaVisitado,
    cambiaAlEnfocar: conFoco !== sinFoco,
    hiddenAncestor: !!el.closest('[aria-hidden="true"]'),
  });
})()`

const evalInPage = async (expression) =>
  (await send('Runtime.evaluate', { expression, returnByValue: true })).result?.value

async function pressTab() {
  const base = { windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9, code: 'Tab', key: 'Tab' }
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...base })
  await send('Input.dispatchKeyEvent', { type: 'keyUp', ...base })
  await sleep(50)
}

async function a11yPhase() {
  console.log('\nACCESIBILIDAD DE TECLADO (foco visible y orden de tabulación)')
  for (const vp of A11Y_VIEWPORTS) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 1,
      mobile: vp.mobile,
    })
    for (const route of ROUTES) {
      cases++
      await send('Page.navigate', { url: BASE + route.path })
      await waitFor(route.sel, 200)
      await sleep(600)

      // Reinicia las marcas de visita y arranca desde el principio del documento.
      await evalInPage(
        `document.querySelectorAll('[data-a11y-seen]').forEach((el) => el.removeAttribute('data-a11y-seen')); document.body.setAttribute('tabindex', '-1'); document.body.focus()`,
      )

      const sinIndicador = []
      const sinNombre = []
      const enAriaHidden = []
      let paradas = 0

      for (let i = 1; i <= MAX_TABS; i++) {
        await pressTab()
        const info = JSON.parse((await evalInPage(FOCUS_INFO)) || 'null')
        if (!info || info.tag === 'body' || info.yaVisitado) break
        paradas++
        if (!info.cambiaAlEnfocar) sinIndicador.push(info)
        if (info.hiddenAncestor) enAriaHidden.push(info)
        if (!info.name && (info.tag === 'a' || info.tag === 'button')) sinNombre.push(info)
      }

      const problems = []
      if (!paradas) problems.push('no se pudo recorrer el orden de tabulación')
      if (sinIndicador.length) problems.push(`${sinIndicador.length} sin indicador de foco`)
      if (sinNombre.length) problems.push(`${sinNombre.length} control(es) sin nombre accesible`)
      if (enAriaHidden.length) problems.push(`${enAriaHidden.length} enfocable(s) dentro de aria-hidden`)

      if (problems.length) {
        failures.push({ vp, route, problems, d: {} })
        console.log(`  ✘ ${vp.name.padEnd(10)} ${route.label.padEnd(8)} ${problems.join(' · ')}`)
        for (const s of sinIndicador.slice(0, 5))
          console.log(`      sin indicador de foco: <${s.tag} class="${s.cls}"> "${s.name}"`)
        for (const s of sinNombre.slice(0, 5))
          console.log(`      sin nombre accesible: <${s.tag} class="${s.cls}"> [${s.w}×${s.h}]`)
        for (const s of enAriaHidden.slice(0, 5))
          console.log(`      dentro de aria-hidden: <${s.tag} class="${s.cls}"> "${s.name}"`)
      } else {
        console.log(
          `  ✔ ${vp.name.padEnd(10)} ${route.label.padEnd(8)} ${paradas} paradas · foco visible en todas · 0 en aria-hidden · 0 sin nombre`,
        )
      }
    }
  }
}

if (RUN_A11Y) await a11yPhase()

ws.close()
shutdown()

console.log(`\n${cases - failures.length}/${cases} casos sin problemas`)
if (failures.length) {
  console.log(`FALLARON ${failures.length} caso(s).`)
  process.exit(1)
}
console.log('Todo en orden.')
