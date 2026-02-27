# SpryFi Landing Page — AI Context

## Project Overview
React + Vite + TypeScript + Tailwind CSS + shadcn/ui landing page for SpryFi home internet service. Supabase backend with edge functions.

## Coverage Check Flow
**API**: `POST https://coverage.spry.network/api/check-coverage`
```json
// Request
{ "address_line1": "...", "city": "...", "state": "...", "zip_code": "..." }

// Response
{ "serviceable": true|false, "provider": "spryfi"|"verizon"|null, "redirect": "/spryfi-service"|"/verizon-service"|"/not-serviceable" }
```
API internally queries SpryFi spatial coverage first, falls back to Verizon FWA check.

### Flow
1. User clicks "Check Availability" (Hero or PlansSection)
2. Address modal → Contact info modal → save lead → call coverage API
3. Store result in `sessionStorage("coverage_result")` → navigate to `redirect` URL

### Three Outcome Pages
| Route | Component | Provider | What shows |
|---|---|---|---|
| `/spryfi-service` | `SpryFiService.tsx` | `"spryfi"` | No Stripe checkout — collects phone + contact pref (call/text), sends RRK Lead email to info@sprywireless.net, shows thank you page with contact info |
| `/verizon-service` | `VerizonService.tsx` | `"verizon"` | 2 plans: **$89/mo** + **$129/mo** (both "SpryFi Home") |
| `/not-serviceable` | `NotServiceable.tsx` | `null` | "Not in your area yet" — notify me form |

## SpryFi Direct (RRK) Flow
For addresses that match the spatial query (SpryFi direct coverage):
1. User lands on `/spryfi-service` after coverage check
2. Page shows pricing ($89.99/mo) and collects: phone number + contact preference (call or text)
3. On submit: edge function `notify-rrk-lead` sends email to **info@sprywireless.net** with subject **"RRK Lead"**
4. Thank you page displays: "We'll contact you within 24 hours" + phone **(512) 656-8732** + email **info@sprywireless.net**

## Pricing Structure
- **SpryFi Direct Coverage**: 1 plan — $89.99/mo ("SpryFi Home")
- **Verizon Partnership Coverage**: 2 plans — $89/mo (1-3 people) and $129/mo (bigger households), both called "SpryFi Home"
- No speeds or technical details shown to customers — selling simple internet
- No contracts, no data caps, free WiFi router included, 14-day money-back guarantee

## Key Files
| File | Purpose |
|---|---|
| `src/components/Hero.tsx` | Hero section with "Check Availability" — exports `parseMapboxAddress()` |
| `src/components/PlansSection.tsx` | Simple CTA section ("Starting at $89/mo") — drives to check availability |
| `src/pages/SpryFiService.tsx` | SpryFi direct result page — collects phone + contact preference, sends RRK Lead email, shows thank you |
| `src/pages/VerizonService.tsx` | Verizon result page — two plan cards ($89/$129) + "Get Started" → CheckoutModal |
| `src/pages/NotServiceable.tsx` | Not serviceable — "Notify Me" CTA |
| `src/pages/Index.tsx` | Landing page — assembles Hero, PainPoints, SocialProof, WhySpryFi, Comparison, PlansSection, FounderVideo, HowItWorks, Guarantee, Footer |
| `src/App.tsx` | Router — all routes including `/spryfi-service`, `/verizon-service`, `/not-serviceable` |
| `src/components/checkout/CheckoutModal.tsx` | Multi-step checkout flow (plan selection → wifi setup → router → payment) |
| `src/components/checkout/steps/PlanSelection.tsx` | Plan selection step inside checkout — SpryFi Home $89/mo + $129/mo |
| `src/hooks/useAddressSearch.ts` | Mapbox geocoding hook for address autocomplete |
| `src/components/SimpleAddressInput.tsx` | Address autocomplete input component |
| `src/utils/userDataUtils.ts` | Helper to save user data to sessionStorage |
| `supabase/functions/notify-rrk-lead/index.ts` | Edge function that sends RRK Lead email to info@sprywireless.net |

## Design System
- Primary blue: `#0047AB`
- Gradient backgrounds: `from-blue-900 via-blue-700 to-blue-500`
- Cards: white with shadow-2xl or `bg-white/10 backdrop-blur-sm` for glass effect
- Decorative: large semi-transparent border rings positioned absolute
- No flash sale banners, no discount badges, no countdown timers — clean and simple

## Session Storage Keys
- `coverage_result` — full coverage check result with address, contact, provider, serviceable
- `qualification_result` — set before opening CheckoutModal (`{ qualified, network_type, provider }`)

## Environment
- `VITE_MAPBOX_TOKEN` — Mapbox geocoding API key
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — Supabase connection

## Last Updated
All flash sale logic removed. PlansSection simplified to CTA-only (no pricing cards). Service pages show provider-specific pricing. PlanSelection checkout step updated with $89/$129 pricing, no speeds.
