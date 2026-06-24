#!/usr/bin/env bash
# Lastro ad render pipeline: rasterizes editable SVG ad templates to PNG
# (and optional JPG) for upload to ad platforms.
#
# Why this exists: ad platforms (LinkedIn, Meta, X, Google) ingest PNG/JPG,
# not SVG. This is the bridge from the editable source to an uploadable asset.
#
# Requirements: rsvg-convert (preferred) OR ImageMagick `magick`/`convert`.
# Usage:
#   design-system/scripts/render.sh                  # render every SVG in examples/ + outputs/
#   design-system/scripts/render.sh path/to/file.svg # render one file
#   FORMAT=jpg design-system/scripts/render.sh        # also emit JPG (white-free, quality 92)
#   SCALE=2 design-system/scripts/render.sh           # 2x export for retina/source
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RENDER_DIR="${ROOT}/outputs/png"
SCALE="${SCALE:-1}"
FORMAT="${FORMAT:-png}"

mkdir -p "${RENDER_DIR}"

have() { command -v "$1" >/dev/null 2>&1; }

if have rsvg-convert; then
  ENGINE="rsvg"
elif have magick; then
  ENGINE="magick"
elif have convert; then
  ENGINE="convert"
else
  echo "ERROR: need rsvg-convert or ImageMagick (magick/convert) on PATH." >&2
  echo "Install: brew install librsvg   # or   brew install imagemagick" >&2
  exit 1
fi
echo "Render engine: ${ENGINE} (scale=${SCALE}, format=${FORMAT})"

# Collect targets.
targets=()
if [[ $# -gt 0 ]]; then
  targets=("$@")
else
  while IFS= read -r f; do targets+=("$f"); done < <(
    find "${ROOT}/examples" "${ROOT}/outputs" -type f -name '*.svg' 2>/dev/null | sort
  )
fi

if [[ ${#targets[@]} -eq 0 ]]; then
  echo "No SVG targets found." >&2
  exit 0
fi

# Read intrinsic width/height from the SVG header so output matches the artboard.
dimension() { # $1=file $2=attr(width|height)
  sed -n '1,5p' "$1" | grep -oE "$2=\"[0-9.]+\"" | head -1 | grep -oE '[0-9.]+'
}

for svg in "${targets[@]}"; do
  [[ -f "$svg" ]] || { echo "skip (missing): $svg" >&2; continue; }
  base="$(basename "${svg%.svg}")"
  w="$(dimension "$svg" width)"; h="$(dimension "$svg" height)"
  : "${w:=1200}"; : "${h:=627}"
  ow=$(awk "BEGIN{print int(${w}*${SCALE})}")
  oh=$(awk "BEGIN{print int(${h}*${SCALE})}")
  out="${RENDER_DIR}/${base}.png"

  case "${ENGINE}" in
    rsvg)   rsvg-convert -w "${ow}" -h "${oh}" "$svg" -o "$out" ;;
    magick) magick -background none -density 144 "$svg" -resize "${ow}x${oh}" "$out" ;;
    convert) convert -background none -density 144 "$svg" -resize "${ow}x${oh}" "$out" ;;
  esac
  echo "  png  ${out}  (${ow}x${oh})"

  if [[ "${FORMAT}" == "jpg" ]]; then
    jpg="${RENDER_DIR}/${base}.jpg"
    if have magick; then
      magick "$out" -background '#070A0D' -flatten -quality 92 "$jpg"
    elif have convert; then
      convert "$out" -background '#070A0D' -flatten -quality 92 "$jpg"
    fi
    [[ -f "$jpg" ]] && echo "  jpg  ${jpg}"
  fi
done

echo "Done. Output in ${RENDER_DIR}"
