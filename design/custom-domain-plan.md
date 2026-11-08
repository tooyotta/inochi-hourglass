# Custom domain plan

Requested domain: hourglass.toyota.im
Hosting: GitHub Pages (tooyotta/inochi-hourglass, main branch root)
Cloudflare DNS: CNAME hourglass.toyota.im -> tooyotta.github.io, DNS only (proxied false), automatic TTL.
Before mutation, list all records at the exact name and check for conflicts.
Set GitHub Pages custom domain and keep the CNAME file in source. Enable HTTPS once the certificate is ready.
Verify authoritative DNS, Pages domain health, valid TLS, HTTP redirect and app assets.

Status: CNAME file prepared locally. Awaiting Cloudflare CLI authentication. DNS and Pages custom-domain settings have not been changed.
