# VPS deployment

The live deployment is available at https://worksmart.ctaprojects.xyz.

- `docker-compose.yml` runs the client and API on the isolated `worksmart_gateway` network.
- SQLite is stored in the named `worksmart_data` volume.
- `chat-nginx.override.yml` attaches the existing VPS nginx gateway to that network and mounts the generated gateway configuration.
- `nginx/worksmart-http.conf` serves the ACME challenge before certificate issuance.
- `nginx/worksmart-https.conf` redirects HTTP to HTTPS and proxies the SPA and `/api` over TLS.

The VPS certificate-renewal cron checks all certificates twice daily, restores nginx-readable key ownership, and reloads the gateway after renewal. The WorkSmart renewal simulation passed on 20 August 2026.
