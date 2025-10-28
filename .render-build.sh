#!/usr/bin/env bash
# Build setup for Render (runs before start)
apt-get update && apt-get install -y ffmpeg
pip install -r requirements.txt
