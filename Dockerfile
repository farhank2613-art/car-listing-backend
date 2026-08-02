FROM node:24-alpine AS builder
WORKDIR /app
COPY client/package*.json ./client/
COPY server/package*.json ./server/
RUN cd client && npm install
RUN cd server && npm install --production
COPY client/ ./client/
COPY server/ ./server/
RUN cd client && npm run build

FROM node:24-alpine
WORKDIR /app
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/server/ ./server/
COPY --from=builder /app/client/dist ./client/dist
RUN mkdir -p server/data
EXPOSE 4000
CMD ["node", "server/src/index.js"]
