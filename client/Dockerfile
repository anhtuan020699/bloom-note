FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci && npm install --no-save lightningcss-linux-x64-gnu@1.32.0 @tailwindcss/oxide-linux-x64-gnu@4.3.3
COPY . .
ARG API_URL=http://bloomnote-api:4000
ENV API_URL=$API_URL
RUN npm run build
ENV NODE_ENV=production
EXPOSE 5173
CMD ["npm", "start"]
