#!/usr/bin/env bash
# ============================================================
# Monitor SEO de eorder.mx — Search Console API
# Uso:  bash scripts/seo-monitor.sh [dias]
# Requiere: gcloud autenticado (gcloud auth application-default login)
#           con scope https://www.googleapis.com/auth/webmasters.readonly
# ============================================================
set -euo pipefail

DIAS="${1:-28}"
FIN=$(date +%F)
# GNU date (Git Bash) con fallback a formato BSD
INICIO=$(date -d "-${DIAS} days" +%F 2>/dev/null || date -v-${DIAS}d +%F)
SITE="sc-domain%3Aeorder.mx"
API_INSPECT="https://searchconsole.googleapis.com/v1"
API_ANALYTICS="https://www.googleapis.com/webmasters/v3"

TOKEN=$(gcloud auth application-default print-access-token 2>/dev/null)
if [ -z "$TOKEN" ]; then
  echo "ERROR: sin credenciales ADC. Ejecuta:"
  echo "  gcloud auth application-default login --scopes=https://www.googleapis.com/auth/webmasters.readonly,https://www.googleapis.com/auth/cloud-platform"
  exit 1
fi

echo "==================================================="
echo " Monitor SEO eorder.mx — ventana ${INICIO} .. ${FIN}"
echo "==================================================="

# ---------- 1. Inspección de URLs clave ----------
echo ""
echo "== Estado de indexación =="
for RUTA in "/" "/planes" "/contactanos" "/registro/dueno"; do
  URL="https://eorder.mx${RUTA}"
  RES=$(curl -s -X POST "${API_INSPECT}/urlInspection/index:inspect" \
    -H "Authorization: Bearer $TOKEN" \
    -H "X-Goog-User-Project: project-edf05916-52e7-4a8f-a6a" \
    -H "Content-Type: application/json" \
    -d "{\"siteUrl\":\"sc-domain:eorder.mx\",\"inspectionUrl\":\"${URL}\",\"languageCode\":\"es\"}")
  echo "$RES" | python -c "
import json,sys
ruta = '${RUTA}'
try:
    d = json.load(sys.stdin)
    idx = d.get('inspectionResult',{}).get('indexStatusResult',{})
    print(f\"  {ruta:18} veredicto: {idx.get('verdict','?'):10} | {idx.get('coverageState','?')[:60]} | rastreo: {(idx.get('lastCrawlTime') or 'nunca')[:10]}\")
except Exception as e:
    print(f'  {ruta:18} error al inspeccionar: {e}')
"
done

# ---------- 2. Posicionamiento (Search Analytics) ----------
echo ""
echo "== Clics e impresiones por página (últimos ${DIAS} días) =="
curl -s -X POST "${API_ANALYTICS}/sites/${SITE}/searchAnalytics/query" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Goog-User-Project: project-edf05916-52e7-4a8f-a6a" \
  -H "Content-Type: application/json" \
  -d "{\"startDate\":\"${INICIO}\",\"endDate\":\"${FIN}\",\"dimensions\":[\"page\"],\"rowLimit\":10}" \
  | python -c "
import json,sys
try:
    d = json.load(sys.stdin)
    rows = d.get('rows',[])
    if not rows:
        print('  (sin datos aún — Google puede tardar 2-3 días en reportar)')
    for r in rows:
        print(f\"  {r['keys'][0]:45} clics: {r.get('clicks',0):6.0f} | impresiones: {r.get('impressions',0):7.0f} | CTR: {r.get('ctr',0)*100:5.1f}% | pos: {r.get('position',0):6.1f}\")
except Exception as e:
    print(f'  error: {e}')
"

# ---------- 3. Top queries ----------
echo ""
echo "== Top consultas (últimos ${DIAS} días) =="
curl -s -X POST "${API_ANALYTICS}/sites/${SITE}/searchAnalytics/query" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Goog-User-Project: project-edf05916-52e7-4a8f-a6a" \
  -H "Content-Type: application/json" \
  -d "{\"startDate\":\"${INICIO}\",\"endDate\":\"${FIN}\",\"dimensions\":[\"query\"],\"rowLimit\":10}" \
  | python -c "
import json,sys
try:
    d = json.load(sys.stdin)
    rows = d.get('rows',[])
    if not rows:
        print('  (sin datos aún)')
    for r in rows:
        print(f\"  '{r['keys'][0][:40]}' clics: {r.get('clicks',0):6.0f} | impresiones: {r.get('impressions',0):7.0f} | pos: {r.get('position',0):6.1f}\")
except Exception as e:
    print(f'  error: {e}')
"

echo ""
echo "Fin. Para automatizar: programa este script (cron / Task Scheduler) semanalmente."
