# Playwright image ships Chromium + all system libraries needed for PDF rendering.
FROM mcr.microsoft.com/playwright:v1.63.0-noble
WORKDIR /app
ENV NODE_ENV=production PORT=3000 DATA_DIR=/data
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN mkdir -p /data
EXPOSE 3000
CMD ["node", "src/server.js"]
