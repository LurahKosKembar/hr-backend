# ----------------------------
# 1) BUILD STAGE
# ----------------------------
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ----------------------------
# 2) RUN STAGE
# ----------------------------
FROM node:20

WORKDIR /app

# Only copy what is needed in production
COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

CMD ["npm", "start"]
