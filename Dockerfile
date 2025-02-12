# Use an official Node.js runtime as base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project files to the container
COPY . .

# Expose the application port
EXPOSE 3000

# Run database migrations (if using TypeORM migrations)
# RUN npm run migration:run

# Start the NestJS application
CMD ["npm", "run", "start:dev"]
