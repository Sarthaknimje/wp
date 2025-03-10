#!/bin/bash

# Start the WarpX app
cd /Users/sarthakchandrashekharnimje/projects/warps/ai
npm start &
WARP_PID=$!

# Start the Telegram bot
cd /Users/sarthakchandrashekharnimje/projects/warps/ai
npm run bot &
BOT_PID=$!

# Start the landing page
cd /Users/sarthakchandrashekharnimje/projects/warps/landing
PORT=8000 npm start &
LANDING_PID=$!

echo "WarpX app running on http://localhost:3000"
echo "Landing page running on http://localhost:8000"
echo "Telegram bot running at @WarpX_bot"
echo ""
echo "Press Ctrl+C to stop all services"

# Trap Ctrl+C to kill all processes
trap "kill $WARP_PID $BOT_PID $LANDING_PID; exit" INT

# Wait for any process to exit
wait 