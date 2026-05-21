import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const eventsPath = path.join(projectRoot, 'src', 'data', 'events.ts')
const outputDir = path.join(projectRoot, 'public', 'event-images')

const typePalettes = {
  emblem_event: ['#143571', '#ffd447', '#fff8e8'],
  wonder_pick: ['#0f766e', '#7dd3fc', '#ecfeff'],
  drop_event: ['#b91c1c', '#fb923c', '#fff7ed'],
  mass_outbreak: ['#166534', '#86efac', '#f0fdf4'],
  special_missions: ['#7c2d12', '#facc15', '#fffbeb'],
  special_event: ['#3730a3', '#c4b5fd', '#eef2ff'],
}

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function parseEvents(source) {
  const blocks = source.split(/\n\s*createEvent\(\{/).slice(1)
  return blocks
    .map((block) => {
      const slug = block.match(/slug:\s*'([^']+)'/)?.[1]
      const name = block.match(/name:\s*'([^']+)'/)?.[1]
      const type = block.match(/type:\s*'([^']+)'/)?.[1]
      const setName = block.match(/linkedSetName:\s*'([^']+)'/)?.[1]
      return slug && name && type ? { slug, name, type, setName } : null
    })
    .filter(Boolean)
}

function buildSvg(event) {
  const [primary, accent, surface] = typePalettes[event.type] ?? typePalettes.special_event
  const titleParts = event.name.split(' ')
  const titleLineOne = titleParts.slice(0, 4).join(' ')
  const titleLineTwo = titleParts.slice(4).join(' ')
  const badge = event.setName ?? event.type.replaceAll('_', ' ')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540" role="img" aria-label="${escapeXml(event.name)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${surface}"/>
      <stop offset="0.55" stop-color="#fffaf0"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0.6"/>
    </linearGradient>
    <radialGradient id="orb" cx="0.35" cy="0.35" r="0.75">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.95"/>
      <stop offset="0.52" stop-color="${accent}" stop-opacity="0.7"/>
      <stop offset="1" stop-color="${primary}" stop-opacity="0.9"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#1f2937" flood-opacity="0.24"/>
    </filter>
  </defs>
  <rect width="960" height="540" rx="54" fill="url(#bg)"/>
  <circle cx="760" cy="118" r="180" fill="${accent}" opacity="0.24"/>
  <circle cx="90" cy="455" r="160" fill="${primary}" opacity="0.1"/>
  <g filter="url(#shadow)">
    <circle cx="705" cy="280" r="126" fill="url(#orb)"/>
    <path d="M590 280h230" stroke="#111827" stroke-opacity="0.22" stroke-width="18" stroke-linecap="round"/>
    <circle cx="705" cy="280" r="44" fill="#fffaf0" stroke="#111827" stroke-opacity="0.28" stroke-width="14"/>
  </g>
  <rect x="64" y="62" width="248" height="46" rx="23" fill="${primary}" opacity="0.92"/>
  <text x="88" y="92" font-family="Verdana, Geneva, sans-serif" font-size="22" font-weight="700" fill="#fffaf0">${escapeXml(badge)}</text>
  <text x="70" y="225" font-family="Georgia, serif" font-size="58" font-weight="800" fill="#1f2937">${escapeXml(titleLineOne)}</text>
  ${titleLineTwo ? `<text x="70" y="292" font-family="Georgia, serif" font-size="58" font-weight="800" fill="#1f2937">${escapeXml(titleLineTwo)}</text>` : ''}
  <text x="74" y="378" font-family="Verdana, Geneva, sans-serif" font-size="24" font-weight="700" fill="${primary}">Archivio eventi e achievement</text>
  <path d="M72 410h390" stroke="${accent}" stroke-width="10" stroke-linecap="round"/>
</svg>
`
}

await mkdir(outputDir, { recursive: true })
const events = parseEvents(await readFile(eventsPath, 'utf8'))

await Promise.all(
  events.map((event) => writeFile(path.join(outputDir, `${event.slug}.svg`), buildSvg(event), 'utf8')),
)

await writeFile(
  path.join(outputDir, 'default-event.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540" role="img" aria-label="Evento">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff8e8"/>
      <stop offset="1" stop-color="#dbeafe"/>
    </linearGradient>
  </defs>
  <rect width="960" height="540" rx="54" fill="url(#bg)"/>
  <circle cx="720" cy="160" r="150" fill="#ffd447" opacity="0.22"/>
  <circle cx="180" cy="410" r="120" fill="#143571" opacity="0.1"/>
  <circle cx="600" cy="270" r="120" fill="#ffffff" stroke="#143571" stroke-opacity="0.18" stroke-width="16"/>
  <path d="M480 270h240" stroke="#143571" stroke-opacity="0.22" stroke-width="18" stroke-linecap="round"/>
  <circle cx="600" cy="270" r="42" fill="#ffffff" stroke="#143571" stroke-opacity="0.24" stroke-width="14"/>
  <text x="74" y="220" font-family="Georgia, serif" font-size="62" font-weight="800" fill="#1f2937">Evento</text>
  <text x="74" y="292" font-family="Verdana, Geneva, sans-serif" font-size="24" font-weight="700" fill="#143571">Archivio locale del portale</text>
  </svg>\n`,
  'utf8',
)

console.log(`Generated event images: ${events.length}`)
