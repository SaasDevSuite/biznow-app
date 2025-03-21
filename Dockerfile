# Use Node.js as the base image
FROM node:20-alpine
ENV NEXT_TELEMETRY_DISABLED=1

ARG DATABASE_URL
ARG AUTH_SECRET

# Set environment variables
ENV DATABASE_URL=${DATABASE_URL}
ENV AUTH_SECRET=${AUTH_SECRET}

# Copy the app's source code to the container
# Set the working directory in the container
WORKDIR /app

# Install necessary build dependencies including OpenSSL
RUN apk add --no-cache libc6-compat openssl openssl-dev

# Copy package.json and yarn.lock to the container
COPY package.json ./

# Install dependencies
RUN npm install



COPY . .
# Install OpenSSL for build stage
RUN apk add --no-cache openssl openssl-dev
# Build the Next app
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Serve the production build
CMD ["npm", "start"]