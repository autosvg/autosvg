#!/bin/sh

if [ -z "$BROWSER" ]; then
  if [ "$OSTYPE" = "darwin"* ]; then
    echo "Set the BROWSER environment variable to use a specific browser"
    BROWSER=open
  elif command -v xdg-open 2>/dev/null; then
    echo "Set the BROWSER environment variable to use a specific browser"
    BROWSER=xdg-open
  else
    echo "You must set the BROWSER environment variable to the appropriate command"
    return 1
  fi
fi

(sleep 1 && $BROWSER http://localhost:3333/ &> /dev/null) & brunch watch --server
