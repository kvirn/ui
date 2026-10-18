# The local twin of the CI `gates` job: Chromium and its system libraries come from the Playwright image,
# so the Playwright version below must equal the catalog's (a test checks it). Tag and digest are both
# pinned; bump them together.
FROM mcr.microsoft.com/playwright:v1.63.0-noble@sha256:eff16c30e6f3f4af0a03fa4b706120d5e9b0891c344a27d64559aff5900a4a27

ARG PNPM_VERSION
RUN node --version | grep -q '^v24\.' && npm install --global pnpm@${PNPM_VERSION}

ENV CI=true \
    npm_config_store_dir=/pnpm-store
WORKDIR /work
