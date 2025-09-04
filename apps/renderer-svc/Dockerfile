FROM node:20-alpine
WORKDIR /app

COPY package.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/renderer-svc/package.json apps/renderer-svc/

RUN npm install --prefix packages/shared && npm run build --prefix packages/shared

COPY . .
RUN npm install --prefix apps/renderer-svc && npm run build --prefix apps/renderer-svc

EXPOSE 8080
CMD ["node","apps/renderer-svc/dist/main.js"]

