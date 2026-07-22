#!/bin/bash
cd /Users/lauraeckertrodrigues/lastro
REF=web/public/media/hero/hero-origin.png
OUT=output/lastre-hero-motion/stills
S2="Wide documentary frame at an open-pit mine quarry floor. A crew in soiled yellow hi-vis coveralls works around a hydraulic rock drill, grey-black crushed ore rubble filling the foreground, a tracked excavator behind them lifting a bucket of broken rock, fine pale dust hanging in still overcast light, terraced pit walls receding into haze. Shot on ARRI Alexa 35mm, soft flat daylight, desaturated earthy palette, visible organic film grain, unretouched, no text."
S4="A loaded yellow haul truck climbs the spiral bench road out of a vast open-pit mine carrying ore toward the rim, terraced walls towering around it, a plume of pale dust trailing from the tyres, overcast diffuse light, distant excavators on the benches below, wide establishing scale, desaturated earthy documentary palette, visible organic grain, no text."
for n in 2 4; do
  varname="S$n"; P="${!varname}"
  echo "== still $n start =="
  URL=$(higgsfield generate create nano_banana_2 --prompt "$P" --image $REF --aspect_ratio "16:9" --resolution 2k --wait --wait-timeout 8m --wait-interval 8s 2>/dev/null | grep -oE 'https://[^ ]+\.png' | tail -1)
  echo "$n $URL" >> $OUT/urls2.txt
  [ -n "$URL" ] && curl -s -o $OUT/still$n.png "$URL" && echo "== still $n saved =="
done
echo DONE
