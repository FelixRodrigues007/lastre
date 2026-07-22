#!/bin/bash
cd /Users/lauraeckertrodrigues/lastro/output/lastre-hero-motion
NAMES="shot2 shot3 shot4"
ID_shot2=eafdf4bc-98be-450b-a045-99b08d6d5c61
ID_shot3=b511452b-531b-442c-ac9d-496c4f337225
ID_shot4=53966287-3558-4d77-ba95-9b3f9de66fb6
for i in $(seq 1 60); do
  LIST=$(higgsfield generate list --size 15 2>/dev/null)
  dc=0
  for name in $NAMES; do
    eval id=\$ID_$name
    [ -f shots/$name.mp4 ] && { dc=$((dc+1)); continue; }
    line=$(echo "$LIST" | grep "$id")
    if echo "$line" | grep -q completed; then
      url=$(echo "$line" | grep -oE 'https://[^ ]+\.mp4' | head -1)
      [ -n "$url" ] && curl -s -o shots/$name.mp4 "$url" && echo "$(date +%T) $name DONE" && dc=$((dc+1))
    else
      echo "$(date +%T) $name pending"
    fi
  done
  [ $dc -eq 3 ] && { echo "ALL DONE"; break; }
  sleep 15
done
echo "---final---"; ls -lh shots/*.mp4
