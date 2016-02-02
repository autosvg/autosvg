#!/bin/sh

rm -rf pages/*
brunch build -e deploy
cd pages
git add -A
git commit -m "YAWZA"
git push
