#!/bin/sh

if [ -z "$BROWSER" ]; then
  echo "You should set the BROWSER environment variable"
else
  (sleep 1 && $BROWSER http://localhost:3333/ &> /dev/null) & brunch watch --server
fi
