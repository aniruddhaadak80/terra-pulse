# Contributing to Terra Pulse

Thanks for helping build the open planetary nervous system! 🌍

## Ground rules

- Be kind. No harassment, no spam, no drive-by self-promo.
- Small, focused PRs beat mega-PRs. One feature/fix per PR.
- Automated risk output is safety-adjacent: never present it as an official warning. Keep the USGS + local-authority disclaimer on any new surface.

## Setup

```bash
git clone https://github.com/aniruddhaadak80/terra-pulse.git
cd terra-pulse
npm install
npm run dev
```

No env vars needed. Tests/lint:

```bash
npm run lint
npm run build
```

## Where to help

- **Feeds:** more EONET geometry (polygons), GDACS/NOAA sources, per-region pages
- **Risk engine:** i18n safety actions, coastal-distance estimator, aftershock model notes
- **Crypto:** ML-DSA-65 signature envelope at the marked swap-in point in `src/lib/seal.ts`
- **Agents:** MCP streamable-HTTP transport, tool schemas for more clients
- **UX:** Playwright smoke tests, OG image generator, light mode, reduced-motion pass

## PR checklist

- [ ] `npm run lint` and `npm run build` pass
- [ ] Description explains *why*, with before/after screenshots for UI
- [ ] No secrets, keys, or personal data committed
- [ ] Docs updated if you touched `/api/*` or MCP tools
