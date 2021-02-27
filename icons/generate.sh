#!/bin/bash
# Uses the built-in mac sips command to resize images
sips -p 302 302 icon-original.png --out icon-square.png
sips -z 128 128 icon-square.png --out icon128.png
sips -z 48 48 icon-square.png --out icon48.png
sips -z 16 16 icon-square.png --out icon16.png
