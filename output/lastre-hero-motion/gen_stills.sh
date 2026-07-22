#!/bin/bash
cd /Users/lauraeckertrodrigues/lastro
REF=web/public/media/hero/hero-origin.png
OUT=output/lastre-hero-motion/stills
: > $OUT/urls.txt

S2="Wide documentary frame at an open-pit mine quarry floor. A crew in soiled yellow hi-vis coveralls works around a hydraulic rock drill, grey-black crushed ore rubble filling the immediate foreground, a tracked excavator behind them lifting a bucket of broken rock, fine pale dust hanging in still overcast light, terraced pit walls receding into haze. Shot on ARRI Alexa 35mm, soft flat daylight around 6000 Kelvin, desaturated earthy palette, visible organic film grain, slight asymmetry, unretouched, no text, no captions. Composition and art direction inspired in the work of award-winning directors."

S3="Close documentary shot of a miner's dust-covered gloved hands holding a fist-sized chunk of raw metallic ore, sharp crystalline facets catching dull overcast light, blurred quarry rock face and a hi-vis crew far behind, shallow depth of field at T2.8, cold grey-green earthy grade, fine pale dust clinging to the skin of the rock and the glove, visible organic grain, unretouched, no plastic texture, no text. Composition and art direction inspired in the work of award-winning directors."

S4="A loaded yellow haul truck climbs the spiral bench road out of a vast open-pit mine carrying ore toward the rim, terraced walls towering around it, a plume of pale dust trailing from the tyres, overcast diffuse light, distant excavators working on the benches below, wide establishing sense of scale, desaturated earthy documentary palette, visible organic grain, slight handheld imperfection, no text. Composition and art direction inspired in the work of award-winning directors."

for n in 2 3 4; do
  varname="S$n"
  P="${!varname}"
  echo "== still $n =="
  URL=$(higgsfield generate create nano_banana_2 --prompt "$P" --image $REF --aspect_ratio "16:9" --resolution 2k --wait --wait-timeout 10m --wait-interval 8s --json 2>/dev/null | grep -oE 'https://[^"]+\.png' | head -1)
  echo "$n $URL" | tee -a $OUT/urls.txt
  if [ -n "$URL" ]; then curl -s -o $OUT/still$n.png "$URL"; fi
done
echo "DONE"
