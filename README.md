# SafeCheck

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Deployed on Vercel](https://img.shields.io/badge/Vercel-Deployed-000?logo=vercel)](https://iamgood-psi.vercel.app)

A quiet safety companion for people living alone. Simple, one-tap check-ins that let loved ones know you're okay — with automatic alerts when a check-in is missed.

**[Live Demo →](https://iamgood-psi.vercel.app)**

![SafeCheck Screenshot](screenshot.png)

---

## Overview

SafeCheck is designed for elderly users and non-technical individuals who need a reliable, minimal way to confirm their safety on a regular schedule. If a check-in is missed, emergency contacts are automatically notified via email.

The tone is **calm, trustworthy, and supportive** — a quiet safety companion, not an emergency panic tool.

## Features

- **One-tap check-in** — Large, accessible button to confirm safety
- **Health status tags** — "I'm okay", "I feel unwell", "Need to talk"
- **Emergency contacts** — Up to 5 contacts with email, phone, and relationship
- **Flexible scheduling** — Daily, twice-daily, weekly, or custom intervals
- **Configurable grace period** — 15 min to 2 hours before alerts fire
- **Email alerts** — Automatic notifications to contacts via [Resend](https://resend.com)
- **Check-in history** — Chronological log grouped by date
- **PWA-ready** — Installable on mobile with "Add to Home Screen"
- **Accessibility-first** — Large touch targets (48px+), high contrast, 18px base font

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Storage | localStorage (client-side MVP) |
| Email | Resend API |
| Monitoring | Vercel Cron Jobs |
| Deployment | Vercel |

## Project Structure

```
src/
├── app/
│   ├── page.tsx                # Onboarding / welcome screen
│   ├── layout.tsx              # Root layout with metadata
│   ├── globals.css             # Global styles & design tokens
│   ├── dashboard/page.tsx      # Main check-in dashboard
│   ├── contacts/page.tsx       # Emergency contacts management
│   ├── history/page.tsx        # Check-in history log
│   ├── settings/page.tsx       # Schedule & preferences
│   └── api/
│       ├── alert/route.ts      # Email alert endpoint
│       └── cron/route.ts       # Vercel Cron health check
├── components/
│   ├── CheckInButton.tsx       # Large check-in button
│   ├── StatusBanner.tsx        # Current status display
│   ├── HealthTags.tsx          # Health status quick-tags
│   └── Navigation.tsx          # Bottom tab navigation
├── hooks/
│   ├── useStore.ts             # Reactive localStorage hook
│   └── useCheckIn.ts           # Check-in logic & state
└── lib/
    ├── types.ts                # TypeScript type definitions
    ├── store.ts                # localStorage state management
    └── scheduler.ts            # Schedule calculation & deadlines
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/alfredang/iamgood.git
cd iamgood
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `RESEND_API_KEY` | Optional | [Resend](https://resend.com) API key for email alerts. Without it, alerts are logged server-side but no emails are sent. |
| `CRON_SECRET` | Optional | Secret token to authenticate Vercel Cron requests. |

Create a `.env.local` file:

```env
RESEND_API_KEY=re_your_key_here
CRON_SECRET=your_secret_here
```

### Build

```bash
npm run build
```

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#5B8A72` (Sage green) | Buttons, active states, accents |
| Success | `#A7C4A0` | "All is well" status |
| Warning | `#E8B931` | "Attention needed" status |
| Danger | `#E07A5F` | "Alert triggered" status |
| Background | `#FAF9F6` | Warm off-white |
| Text | `#2D3436` | Dark charcoal |

## License

MIT
