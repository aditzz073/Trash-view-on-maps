# Use Node.js LTS version
FROM node:18

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the app files
COPY . .

# Expose the port
EXPOSE 3001

# Command to start the app
CMD ["node", "server.js"]
