#!/bin/sh

CMD="node_modules/brunch/bin/brunch"
DIR="$(pwd)/build"

if [ -z "$BROWSER" ]; then
  if [ "$OSTYPE" = "darwin"* ]; then
    echo "Set the BROWSER environment variable to use a specific browser"
    BROWSER=open
  elif command -v xdg-open 2>/dev/null; then
    echo "Set the BROWSER environment variable to use a specific browser"
    BROWSER=xdg-open
  else
    echo "You must set the BROWSER environment variable to the appropriate command"
    exit 1
  fi
fi

CMD="(sleep 1 && $BROWSER"' $LINK '"&> /dev/null) & $CMD"

if [ "$1" = "watch" ]; then
  CMD=$CMD" watch --server"
elif [ "$1" = "build" ]; then
  CMD=""$CMD" build"
else
  echo "Unkown command"
  exit 1
fi

if [ "$2" = "-p" ]; then 
  DIR=$DIR"/pages"
  LINK="file://$DIR"
  CMD=$CMD" -e pages"
else
  LINK="http://localhost:3333/"
  DIR=$DIR"/app"
fi

CMD="$CMD"
echo $CMD
eval $CMD
