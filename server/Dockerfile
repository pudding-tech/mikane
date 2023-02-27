### BUILDER ###
FROM node:18-alpine as builder

# Use directory
WORKDIR /usr/src/app

# Copy packages file and install dependencies
COPY package.json ./
RUN npm install typescript -g
RUN npm install

# Copy everything
COPY ./ ./

# Build to js
RUN tsc -p ./

### FINAL APP ###
FROM node:18-alpine

WORKDIR /usr/src/app
ENV NODE_ENV=production

COPY package.json ./
RUN npm install --production
COPY --from=builder /usr/app/build ./build

EXPOSE 3002

# Run build
CMD ["node", "build/server.js"]

# Commands for building image and running container (substitute latest with version if building a release):
#   docker build -t puddingdebt:latest ./
#   docker run -d --name puddingdebt --env-file .env puddingdebt:latest

# Save and load image (for transferring to another host) (substitute latest with version if saving a release):
#   docker save -o puddingdebt.tar puddingdebt:latest
#   docker load -i puddingdebt.tar