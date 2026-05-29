# Stage 1: build the React client
FROM node:24-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ .
RUN npm run build

# Stage 2: production server
FROM node:24-alpine
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server/ .
COPY --from=client-builder /app/client/dist /app/client/dist
EXPOSE 3200
CMD ["node", "src/app.js"]
