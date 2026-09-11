# Warranty Hunter — Never lose a warranty again

> Started when my family TV died in a storm. We had a warranty, Dad couldn't find the papers. We lost the TV. Hunter exists so that never happens to you.

**Shipaton 2026 — Next Gen entry (Android-only, no store release required).**
Video + this public repo are the judging artifacts.

## What it does

Add → Track → Remind → Act. Save what you bought once, Hunter sorts by days-left (green/amber/red), reminds at 30/7/1 day, keeps the receipt ready to claim.

- Onboarding with the real story
- Home Hunter Board sorted by urgency
- Add purchase + receipt photo (Supabase Storage)
- Detail with countdown + claim checklist + draft claim email
- Hunter Pro paywall via RevenueCat (Free 3 items / Monthly $3.99 / Annual $29.99 trial / Lifetime $79)

## Stack (only what's actually in the build)

RevenueCat, React Native, Expo (managed, Android-only), TypeScript, Supabase, expo-router, expo-notifications

## Run it (Android)

```bash
npm install
cp .env.example .env   # fill SUPABASE + REVENUECAT keys, never commit .env
npx expo start
# press `a` for Android emulator, or scan QR with Expo Go on a real device
```

EAS internal APK for the demo video:

```bash
eas build -p android --profile preview
```

## Env

See `.env.example`. Required:
- `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`, `EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID=pro`

Without keys the app runs in local-only/demo mode (AsyncStorage + demo paywall) so judges can still follow the full journey.

## Supabase

Run `supabase/schema.sql` in your project, create a private `receipts` bucket. RLS: users read/write own rows.

## RevenueCat

- Project entitlement: `pro`
- Offerings: Monthly / Annual (hero, 7-day trial) / Lifetime
- Code: `src/lib/revenuecat.ts` (`configureRevenueCat`, `isPro`, offerings fetch, `purchasePackage` in `app/paywall.tsx`)
- Store billing lights up after a Play listing; until then paywall runs in demo-grace mode and entitlement logic remains reviewable in code + video.

## Repo layout

```
app/            expo-router screens: index, onboarding, add, detail/[id], paywall
src/theme.ts    design tokens (bone bg, safety-orange accent)
src/types.ts    Warranty model, FREE_ITEM_LIMIT=3
src/lib/        expiry, supabase, revenuecat, notifications
src/store/      AsyncStorage-backed WarrantyContext + free/pro gate
src/components/ WarrantyCard, EmptyState
supabase/schema.sql
DEMO_SCRIPT.md  <2min video shot list (matches app 1:1)
SUBMISSION_CHECKLIST.md
```

## License

MIT — see LICENSE.
