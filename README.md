# MPTSAAS — Faceless Video Automation Platform

> Post 3 videos a day without showing your face. AI generates the script, stock footage, voiceover, captions, and MP4 — fully automated.

## What It Does

1. **Pick a niche** — Finance, Fitness, Tech, Crypto, Motivation, Lifestyle...
2. **Enter a topic** — "Why index funds beat active trading"
3. **AI does the rest** — Script → Stock footage → Voiceover → Subtitles → MP4

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js (TypeScript) |
| Video Engine | MoneyPrinterTurbo (Python/FastAPI) |
| LLM | Gemini 2.5 Flash (Google AI) |
| TTS | Gemini Zephyr (built-in) |
| Stock Video | Pexels |
| Video Assembly | FFmpeg + MoviePy |

## Quick Start

```bash
# 1. Clone
git clone https://github.com/playthegameoflife/MPTSAAS.git
cd MPTSAAS

# 2. Install frontend
npm install
cp .env.example .env.local
# Add your API keys to .env.local

# 3. Start frontend
npm run dev

# 4. Start MPT backend (separate terminal)
cd moneyprinter-turbo
uv venv .venv && source .venv/bin/activate
uv pip install -r requirements.txt
cp config.example.toml config.toml
# Add Gemini + Pexels API keys to config.toml
uv run python main.py
```

## Project Structure

```
moneyprinter-turbo/   # Video generation engine (FastAPI)
├── app/              # API routes + services
├── app/services/     # LLM, TTS, video assembly
├── storage/          # Generated videos
└── config.toml       # API keys + settings

src/
├── app/page.tsx      # Landing page
├── app/dashboard/    # Video generation UI
└── lib/mpt.ts        # MPT API client
```

## API Keys Needed

- **Gemini API key** — [ai.google.dev](https://ai.google.dev) (free tier: 60 requests/min)
- **Pexels API key** — [pexels.io/api](https://www.pexels.io/api) (free tier: 20 videos/month)

## Video Output

Generated videos are **9:16 vertical** (1080×1920) — optimized for TikTok, Reels, Shorts. Also supports 16:9 (YouTube).

---

*MoneyPrinterTurbo is MIT licensed (harry0703/MoneyPrinterTurbo). This repo wraps it as a SaaS product.*
