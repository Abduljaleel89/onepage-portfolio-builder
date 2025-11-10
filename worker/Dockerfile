FROM node:18-bullseye-slim
WORKDIR /usr/src/app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || npm install
COPY . .
CMD ["npm","start"]
