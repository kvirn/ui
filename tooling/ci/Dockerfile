# The local twin of the CI `gates` job: Chromium and its system libraries come from the Playwright image,
# so the Playwright version below must equal the catalog's (a test checks it). Tag and digest are both
# pinned; bump them together.
FROM mcr.microsoft.com/playwright:v1.65.1-noble@sha256:1507cbfc550a63a6b7396791ca4f00df17beb56342d2447b3f106c306f525579

ARG PNPM_VERSION
RUN node --version | grep -q '^v24\.' && npm install --global pnpm@${PNPM_VERSION}

ENV CI=true \
    npm_config_store_dir=/pnpm-store
WORKDIR /work
