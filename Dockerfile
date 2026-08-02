FROM node:22-slim
WORKDIR /app
COPY . .
RUN npm install
RUN cd client && npm install && npm run build && cd ../server && npm install --production
EXPOSE 4000
CMD ["npm", "start"]
