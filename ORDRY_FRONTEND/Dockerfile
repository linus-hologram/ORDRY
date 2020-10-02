# build stage
FROM node:lts-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d
COPY nginx/ssl/ordry.at.crt /etc/nginx/ssl/nginx.crt
COPY nginx/ssl/ordry.at.key /etc/nginx/ssl/nginx.key
EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]