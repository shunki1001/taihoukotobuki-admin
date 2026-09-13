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

# コンテナ内での任意コード実行につながる脆弱性が見つかった場合の被害範囲を狭めるため、
# rootではなく非rootユーザーでアプリを起動する
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Copy only necessary files for production
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts ./

USER nextjs

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Start the Next.js app on port 8080
CMD ["npm", "start"]
