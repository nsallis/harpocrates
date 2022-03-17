FROM node
# RUN npm install -g yarn
COPY . .
RUN yarn install
RUN yarn build
CMD ["yarn", "start"]
EXPOSE 3000
