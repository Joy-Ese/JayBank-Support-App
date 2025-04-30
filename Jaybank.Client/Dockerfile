FROM node:slim AS build
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .
RUN npm run build --configuration=production

# Expose port 4200
EXPOSE 4200

# Run stage
# FROM nginx:alpine
# Copy the build output
# COPY --from=build /app/dist/jaybank.client /usr/share/nginx/html
# Copy custom nginx config for Angular
# COPY nginx.conf /etc/nginx/conf.d/default.conf
# Expose port 80 (Nginx's default)
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]

# Start the application using ng serve
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--disable-host-check", "--poll=2000"]
