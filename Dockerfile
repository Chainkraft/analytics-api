# Common build stage
FROM node:16.19.0-alpine3.16 as common-build-stage

# Install puppeteer dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ttf-freefont

COPY . ./app

WORKDIR /app

RUN npm install

EXPOSE 3000

# Production build stage
FROM common-build-stage as production-build-stage

ENV NODE_ENV=production

CMD ["npm", "run", "start"]
