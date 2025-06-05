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

# Build the Next.js app
RUN npm run build

# Production image
FROM node:18-alpine AS runner

WORKDIR /app

# Google OAuth Credentials
ARG GOOGLE_CLIENT_ID_ARG
ARG GOOGLE_CLIENT_SECRET_ARG
ARG ALLOWED_EMAILS_ARG
ARG NEXTAUTH_URL_ARG
ARG NEXTAUTH_SECRET_ARG
ARG NEXT_PUBLIC_CONTENTFUL_SPACE_ID_ARG
ARG NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN_ARG
ARG NEXT_PUBLIC_CONTENTFUL_MANAGEMENT_ACCESS_TOKEN_ARG

ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID_ARG
ENV GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET_ARG
ENV ALLOWED_EMAILS=$ALLOWED_EMAILS_ARG
ENV NEXTAUTH_URL=$NEXTAUTH_URL_ARG
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET_ARG
ENV NEXT_PUBLIC_CONTENTFUL_SPACE_ID=$NEXT_PUBLIC_CONTENTFUL_SPACE_ID_ARG
ENV NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN=$NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN_ARG
ENV NEXT_PUBLIC_CONTENTFUL_MANAGEMENT_ACCESS_TOKEN=$NEXT_PUBLIC_CONTENTFUL_MANAGEMENT_ACCESS_TOKEN_ARG

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
