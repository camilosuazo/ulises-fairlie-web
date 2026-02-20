This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Mercado Pago Integration

The project now includes a full plan checkout flow with Mercado Pago:

- `POST /api/payments/create-preference`: creates Mercado Pago checkout preference.
- `POST /api/mercadopago/webhook`: receives Mercado Pago payment notifications.
- `POST /api/payments/confirm`: syncs payment when user returns to dashboard.

### Required env vars

Configure:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL` (example: `https://ulisesfairlie.com`)
- `MERCADOPAGO_ACCESS_TOKEN`

### Required DB migration

Run `supabase-mercadopago-schema.sql` in Supabase SQL Editor.

When a payment is approved, credits are automatically added and user plan/subscription is updated.

## Google Meet Auto-Link

Class booking now creates a real Google Meet link through Google Calendar API (`POST /api/classes/book`).

Required env vars:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`
- `GOOGLE_CALENDAR_ID` (use `primary` for your own calendar)
- `GOOGLE_CALENDAR_TIMEZONE` (example: `America/Santiago`)
- `GOOGLE_MEET_OWNER_EMAIL` (teacher email)
