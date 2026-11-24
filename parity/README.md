# WALKOFF client parity suite

Same Playwright specs run against two copies of the app:

| Project | URL | What it serves |
|---|---|---|
| `baseline` | http://localhost:4000/walkoff/ | a checkout of the pre-upgrade commit (Angular 8) |
| `upgraded` | http://localhost:4200/walkoff/ | this branch |

The WALKOFF API serves the compiled client (`api/client/dist/walkoff`) and the login page, so each
project is one API instance (on its own port, against its own checkout) behind a small proxy that also
forwards `/walkoff/sockets` to the Socket.IO server. Both API instances share MongoDB/Redis/MinIO.

## Run

```bash
# backing services (ports from data/local_config.yml; Redis on 6379 by default, override with REDIS_URI)
docker run -d --name walkoff_mongo -p 127.0.0.1:27016:27017 mongo:4
docker run -d --name walkoff_redis -p 127.0.0.1:6379:6379 redis:5
pip install 'moto[server]' && moto_server -H 127.0.0.1 -p 9001 &      # S3/MinIO stand-in
(cd socketio && npm ci && node dist/server.js &)                    # :3000

(cd parity && npm ci && npx playwright install chromium)        # proxy + suite deps

# API image (once)
docker build -f parity/backend/Dockerfile.api -t walkoff_core_api:local .

# baseline: a worktree of the pre-upgrade commit, built with Node 12
git worktree add ../walkoff-baseline <baseline-commit>
(cd ../walkoff-baseline/api/client && nvm use 12 && npm ci && npx ng build --prod)
parity/backend/run-api.sh walkoff_api_baseline "$(realpath ../walkoff-baseline)" 8040
node parity/backend/proxy.js 4000 8040 &

# upgraded: this checkout, built with Node 22+
(cd api/client && nvm use 22 && npm ci && npx ng build)
parity/backend/run-api.sh walkoff_api_upgraded "$PWD" 8042
node parity/backend/proxy.js 4200 8042 &

# suite (user must be an existing WALKOFF admin; the default seed is admin/admin)
cd parity
WALKOFF_USERNAME=admin WALKOFF_PASSWORD=... npx playwright test   # both projects
npm run report                                                       # report/README.md + side-by-side PNGs
```

Test data is timestamped (`parity-<kind>-<ms>-<rand>`), new-user passwords are random per run, and every
spec deletes what it creates. Specs assert visible text, counts, enabled state and URLs only.

## Known baseline behaviour the specs pin (not fixed by the upgrade)

- **Sign Out** in the user menu does not leave the app: the `/logout` route never activates.
- **Delete user** sends `DELETE /api/users/undefined` (the client reads `user.id`, the API returns `id_`),
  so the row stays; editing a user does not save for the same reason. The spec cleans up through the API.
- Opening an imported workflow whose app is not installed leaves the editor graph hidden.
