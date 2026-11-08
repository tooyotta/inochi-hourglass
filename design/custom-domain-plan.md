# Custom domain plan

Requested domain: hourglass.toyota.im
Hosting: GitHub Pages (tooyotta/inochi-hourglass, main branch root)
Cloudflare DNS: CNAME hourglass.toyota.im -> tooyotta.github.io, DNS only (proxied false), automatic TTL.
Before mutation, list all records at the exact name and check for conflicts.
Set GitHub Pages custom domain and keep the CNAME file in source. Enable HTTPS once the certificate is ready.
Verify authoritative DNS, Pages domain health, valid TLS, HTTP redirect and app assets.

Status (2026-11-08): Cloudflare CLI OAuth authenticated. Exact-name DNS lookup found no existing records. Created CNAME record 207c904f8e0a651c28e658f2b4926afa in zone 268cfea3247accf8ae890d85c43e8fdb; target tooyotta.github.io, proxied false, automatic TTL. GitHub Pages cname is hourglass.toyota.im. Authoritative Cloudflare DNS and public resolvers 1.1.1.1 / 8.8.8.8 return the CNAME. GitHub Pages serves the app over HTTP when resolved directly to its edge. Certificate issuance and HTTPS enforcement are pending.
