# Used by docker compose for local development (dev stage).
# Render does not need it: it runs the Node app directly.
FROM node:24-alpine AS dev
WORKDIR /app

# Copy only the package files first so the install layer is cached until dependencies change.
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN npm ci

# Source code is bind-mounted by docker-compose; this copy makes the image usable on its own.
COPY tsconfig.base.json ./
COPY packages/shared packages/shared
COPY apps/api apps/api

# @syvra/shared is consumed from its compiled dist/ folder.
RUN npm run build -w packages/shared
EXPOSE 3000
CMD ["npm", "run", "dev", "-w", "apps/api"]
