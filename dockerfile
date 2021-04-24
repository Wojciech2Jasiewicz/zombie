FROM node:12
WORKDIR /app
RUN npm install
EXPOSE 5000
CMD ["npm", "start"]
