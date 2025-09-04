FROM node:20-alpine
WORKDIR /app

COPY package.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/db/package.json packages/db/
COPY packages/ton/package.json packages/ton/
COPY apps/worker/package.json apps/worker/

RUN npm install --prefix packages/shared && npm run build --prefix packages/shared
RUN npm install --prefix packages/db && npm run build --prefix packages/db
RUN npm install --prefix packages/ton && npm run build --prefix packages/ton

COPY . .
RUN npm install --prefix apps/worker && npm run build --prefix apps/worker

CMD ["node","apps/worker/dist/index.js"]

