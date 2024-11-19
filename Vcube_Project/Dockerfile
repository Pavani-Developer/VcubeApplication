# Use the official Node.js image
FROM node:16 AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application
COPY . .

# Build the application
RUN npm run build

# Use a lightweight server to serve your app
FROM nginx:alpine

# Copy the build output and the redirects file
COPY --from=build /app/build /usr/share/nginx/html
COPY --from=build /app/public/_redirects /usr/share/nginx/html/_redirects

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
