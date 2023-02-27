### BUILDER ###
FROM node:18-alpine as builder

# Use directory
WORKDIR /app

# Copy packages file and install dependencies
COPY package.json ./
COPY tsconfig.json ./
RUN npm install

# Copy everything
COPY ./ ./

# Build to js
RUN npx tsc -p ./

### FINAL APP ###
FROM node:18-alpine

# Set default environment
ENV NODE_ENV=production

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY --from=builder /app/build ./build

# Expose port 3002
EXPOSE 3002

# Run build
CMD ["node", "build/server.js"]

# Commands for building image and running container (substitute latest with version if building a release):
#   docker build -t puddingdebt:latest ./
#   docker run -d --name puddingdebt --env-file .env puddingdebt:latest

# Save and load image (for transferring to another host) (substitute latest with version if saving a release):
#   docker save -o puddingdebt.tar puddingdebt:latest
#   docker load -i puddingdebt.tar