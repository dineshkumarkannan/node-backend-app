# Match the Node version used during local development.
FROM node:24-alpine

# All commands below run from this directory inside the image.
WORKDIR /app

# Copy dependency files first so Docker can reuse the install layer.
COPY package*.json ./

# The container runs the app directly, so development dependencies are unnecessary.
RUN npm ci --omit=dev

# Copy the backend source and frontend assets into the image.
COPY src ./src
COPY public ./public

# Document the port used by the Express server.
EXPOSE 8383

# SQLite is experimental in this Node version and needs this flag at startup.
CMD ["node", "--experimental-sqlite", "src/server.js"]
