FROM node:latest
# Copy the npm files into your Docker image. If you do this first, the docker
# daemon can cache the built layers, making your images build faster and be 
# substantially smaller, since most of your dependencies will remain unchanged
# between builds.
ENV NODE_ENV development
WORKDIR /home/node/app

COPY package.json package.json
COPY package-lock.json package-lock.json

# Actually install the dependencies.
RUN npm install
RUN npm install -g ts-node typescript
RUN npm install -g @vue/cli
