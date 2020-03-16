FROM node:12-alpine as build
WORKDIR /build

COPY package*.json ./
RUN npm install --silent

COPY tsconfig.json ./
COPY src ./src
COPY armview-vscode ./armview-vscode
COPY copyStaticAssets.js .
RUN npm run build

# ==========================================

FROM node:12-alpine as runtime
WORKDIR /app

COPY package*.json ./
RUN npm install --production --silent

COPY --from=build /build/dist ./dist
COPY views ./views

EXPOSE 3000
ENTRYPOINT [ "npm", "run", "serve" ]
