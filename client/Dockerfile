FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG API_URL=http://bloomnote-api:4000
ENV API_URL=$API_URL
RUN npm run build
ENV NODE_ENV=production
EXPOSE 5173
CMD ["npm", "start"]
