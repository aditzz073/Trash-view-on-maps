# Use Node.js LTS version
FROM node:18

# Set the working directory
WORKDIR /usr/src/app/proxy

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the app files
COPY . .

# Expose the proxy server port
EXPOSE 3000

# Command to start the proxy server
CMD ["node", "proxy.js"]
