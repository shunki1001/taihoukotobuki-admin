# Use official Node.js image as the base image
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# NEXT_PUBLIC_* はNext.jsのビルド時にクライアントJSへインライン化されるため、
# ここ(builderステージ)で渡す必要がある。どちらも秘密情報ではない
# (Space IDは識別子、ACCESS_TOKENはContentful Delivery APIの閲覧専用トークン)ため
# ビルド引数として扱ってよい。
ARG NEXT_PUBLIC_CONTENTFUL_SPACE_ID_ARG
ARG NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN_ARG
ENV NEXT_PUBLIC_CONTENTFUL_SPACE_ID=$NEXT_PUBLIC_CONTENTFUL_SPACE_ID_ARG
ENV NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN=$NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN_ARG

# Build the Next.js app
RUN npm run build

# Production image
FROM node:18-alpine AS runner

WORKDIR /app

# 秘密情報(GOOGLE_CLIENT_ID/SECRET, ALLOWED_EMAILS, NEXTAUTH_URL/SECRET,
# CONTENTFUL_MANAGEMENT_ACCESS_TOKEN)はビルド時に焼き込まない。
# `docker history` / `docker inspect` で復元できてしまうため、
# Cloud Run実行時にSecret Manager経由で注入する(terraform/main.tf参照)。

# Copy only necessary files for production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.ts ./

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Start the Next.js app on port 8080
CMD ["npm", "start"]
