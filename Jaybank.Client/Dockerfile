# FROM node:20-alpine AS build
FROM node:slim AS build
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .
RUN npm run build --configuration=production

# Run stage
FROM nginx:alpine
# Copy the build output
COPY --from=build /app/dist/jaybank.client /usr/share/nginx/html
# Copy custom nginx config for Angular
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Expose port 80 (Nginx's default)
EXPOSE 80
# EXPOSE 4200
CMD ["nginx", "-g", "daemon off;"]
