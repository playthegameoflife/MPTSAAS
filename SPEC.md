# MoneyPrinterTurbo SaaS — Faceless Video Automation

## Problem Statement

Creators who want a passive-income faceless YouTube/TikTok channel can't produce videos consistently — script writing, footage curation, voiceover, editing, and posting is 2–4 hours per video. Existing AI video tools (InVideo, Veed, Synthesia) are generic, expensive, and still require manual posting.

## Solution

A SaaS wrapper around MoneyPrinterTurbo that lets creators go from **topic → published video on TikTok/YouTube/Facebook in under 60 seconds**, with:
- One-click multi-platform posting via Postiz
- Niche-specific template library (not generic stock footage)
- Tiered plans (Free / $19 / $49)
- Brand kit (logo intro/outro overlays)

**Positioning**: "The Zapier for faceless YouTube channels" — fully automated, no video editing skills needed.

---

## User Stories

### Core Generation Flow
1. As a creator, I want to enter a topic/topic + niche, so that the system generates a complete video without me writing scripts or editing
2. As a creator, I want the system to automatically add a human-sounding voiceover, so that my video doesn't feel robotic
3. As a creator, I want captions/subtitles auto-generated and burned into the video, so that viewers can watch without sound
4. As a creator, I want background music added automatically, so that the video feels polished
5. As a creator, I want to preview the generated video before it posts, so that I can reject bad outputs
6. As a creator, I want my video posted to TikTok, YouTube, and Facebook simultaneously, so that I don't post manually to each platform

### Niche & Templates
7. As a creator, I want to pick from pre-built niche templates (finance, fitness, tech, lifestyle, crypto, motivation), so that footage and pacing match my audience
8. As a creator, I want my own brand kit (logo, intro/outro, color overlay), so that my channel feels consistent across videos
9. As a creator, I want the system to vary the hook/script style per video, so that my channel doesn't feel repetitive

### Monetization & Billing
10. As a visitor, I want to sign up with Google/GitHub, so that I can start without creating yet another password
11. As a new user, I want 3 free videos per month, so that I can try before I buy
12. As a paying user, I want clear plan limits (videos/month), so that I know what I'm paying for
13. As a paying user, I want to upgrade mid-cycle and be charged prorated, so that I'm not punished for signing up mid-month
14. As a paying user, I want to see my generation history and download old videos, so that I can reuse content

### Posting & Scheduling
15. As a creator, I want to connect my TikTok/YouTube/Facebook via Postiz in one click, so that I don't manually re-authenticate
16. As a creator, I want to schedule videos for a specific day/time, so that I can batch content ahead
17. As a creator, I want captions and descriptions auto-generated per-platform, so that each version is optimized

### Content Quality
18. As a creator, I want the system to detect and skip copyrighted music, so that my videos don't get demonetized
19. As a creator, I want video resolution options (720p/1080p), so that I can balance quality vs render time
20. As a creator, I want aspect ratio options (9:16 for TikTok/Reels, 16:9 for YouTube), so that I can target each platform correctly

---

## Implementation Decisions

### Tech Stack
- **Frontend**: Next.js (App Router) — same stack as Fruited's existing frontend
- **Backend**: Python/FastAPI that wraps MoneyPrinterTurbo as a subprocess/Docker container
- **Queue**: Redis + Celery (or Modal.com for serverless Python workers)
- **Storage**: Cloudinary for video storage + CDN (avoids S3 complexity)
- **Auth**: Supabase Auth (same as Fruited) — Google/GitHub SSO
- **Payments**: Stripe (subscriptions + metered billing for overage)
- **Social posting**: Postiz API (already wired into Fruited crons)
- **Rendering**: GPU worker on Modal, Render, or dedicated GPU VM

### Database Schema (Supabase/Postgres)
```
users (extends Supabase auth)
organizations (for team/agency plans)
projects (each YouTube/TikTok channel = one project)
videos (generated video records: script, footage choices, voice, status, output_url, posted_urls)
brand_kits (logo_url, intro_url, outro_url, color_overlay)
social_accounts (postiz credentials per platform)
generations (job queue + credits used per gen)
```

### API Design
```
POST /api/videos/generate
  body: { topic, niche, aspect_ratio, brand_kit_id?, voice_id? }
  returns: { video_id, status: "queued" }

GET /api/videos/:id
  returns: { status, output_url?, error? }

POST /api/videos/:id/post
  body: { platforms: ["tiktok", "youtube", "facebook"], scheduled_at? }

GET /api/videos
  returns: paginated list with status + output_url

POST /api/brand-kits
  body: { name, logo_url, intro_url, outro_url, color_overlay }
```

### Credit System
- Free: 3 videos/month
- $19/mo: 20 videos/month
- $49/mo: unlimited videos/month
- Overage: $2/video above plan limit
- Credits deducted at generation time (before render starts)

### Rendering Pipeline (MoneyPrinterTurbo orchestration)
1. LLM writes script (GPT-4o-mini or local via Ollama for cost savings)
2. Stock footage search + selection (Pixabay API — commercial license)
3. TTS voiceover (ElevenLabs or Azure Neural Voices)
4. Subtitle generation (Whisper on the TTS audio)
5. FFmpeg assembly: footage + voice + subs + music → MP4
6. Upload to Cloudinary
7. Webhook → update DB → notify frontend (SSE or polling)

### Postiz Integration
- Pre-authenticated Postiz accounts per user (OAuth flow)
- `POST /api/videos/:id/post` → calls Postiz API to schedule
- Caption + description templated per platform (YouTube wants longer descriptions, TikTok wants short hooks)

### Seams (where to integrate/test)
1. `generate_video(topic, niche)` function — pure input/output, testable without FFmpeg
2. `post_to_postiz(video_id, platforms)` — mocked in tests
3. Credit deduction gate — checked before render starts
4. Brand kit overlay pipeline — FFmpeg filter chain, testable with small test video

---

## Testing Decisions

- Unit test: script generation (LLM call mocked)
- Unit test: credit deduction before render
- Integration test: video generation pipeline with real FFmpeg (small test video)
- Integration test: Postiz posting (mocked Postiz API)
- E2E: full flow from topic → video URL (real but small test video)

---

## Out of Scope

- Video editing UI (timeline, cuts, preview trimming) — this is a pure automation tool
- Mobile app — web only for v1
- Team collaboration / agency dashboard — individual creator focus
- Custom footage upload — stock footage only
- SEO/title optimization — just generate and post

---

## Further Notes

The core insight: the *output* of MoneyPrinterTurbo is commodity. The moat is the *automation loop* — topic → video → post, with zero manual intervention, at a price point that beats hiring a video editor ($200–500/video) or using a full-service agency ($1K+/month).

The Postiz integration is the differentiator for Fruited: creators who already use Fruited's AI prompts get a unified content workflow. New users get a standalone video product that could eventually plug into Fruited's social graph.
