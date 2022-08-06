FROM node:16.15.1

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

# Run build
CMD ["npm", "run", "startbuild"]

# Commands for building image and running container (substitute latest with version if building a release):
#   docker build -t puddingdebt:latest ./
#   docker run -d --name puddingdebt --env-file .env puddingdebt:latest

# Save and load image (for transferring to another host) (substitute latest with version if saving a release):
#   docker save -o puddingdebt.tar puddingdebt:latest
#   docker load -i puddingdebt.tar