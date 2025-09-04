FROM node:20-alpine
WORKDIR /app

COPY package.json tsconfig.base.json ./
COPY packages/renderer/package.json packages/renderer/
COPY apps/render-worker/package.json apps/render-worker/

RUN npm install --prefix packages/renderer && npm run build --prefix packages/renderer

COPY . .
RUN npm install --prefix apps/render-worker && npm run build --prefix apps/render-worker

CMD ["node","apps/render-worker/dist/index.js"]

