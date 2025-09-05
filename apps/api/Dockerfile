FROM node:20-alpine
WORKDIR /app

# Install and build packages first for better caching
COPY package.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/db/package.json packages/db/
COPY packages/ton/package.json packages/ton/
COPY apps/api/package.json apps/api/

RUN npm install --prefix packages/shared && npm run build --prefix packages/shared
RUN npm install --prefix packages/db && npm run build --prefix packages/db
RUN npm install --prefix packages/ton && npm run build --prefix packages/ton

COPY . .
RUN npm install --prefix apps/api && npm run build --prefix apps/api

EXPOSE 3000
CMD ["node","apps/api/dist/main.js"]
