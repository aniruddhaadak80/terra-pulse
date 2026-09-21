# Security Policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| `main` (latest) | ✅ |

## Reporting a vulnerability

Open a **private** report via GitHub Security Advisories on this repo, or email the maintainer through the GitHub profile. Please include:

- What you found and where (`/api/*` route, component, dependency)
- Steps to reproduce (no live exploits against the production deployment)
- Your suggested severity and fix, if any

We aim to acknowledge within 72 hours and ship a fix or mitigation within 14 days.

## Scope notes

- Terra Pulse proxies public USGS/NASA feeds; it does not store user data, credentials, or PII.
- The `tq384` seal chain is tamper-evidence, not access control — treat it as an integrity log.
- Automated risk briefings are informational. They must never be presented as official warnings.
