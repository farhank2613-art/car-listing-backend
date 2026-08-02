FROM node:20-alpine
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --production
COPY server/ ./
EXPOSE 4000
CMD ["node", "src/index.js"]
