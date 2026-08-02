FROM node:24-alpine
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --production
COPY server/ ./
RUN mkdir -p data
EXPOSE 4000
CMD ["node", "src/index.js"]
