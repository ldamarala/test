# Use the latest Node.js image
FROM node:18-buster-slim

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package.json ./

# Install dependencies
RUN npm install
# RUN NODE_ENV=development npm i  --force

# Copy the remaining application code
COPY . .

# Set the environment variable for the server path
# ARG AUTH_SERVER_PATH
# ENV AUTH_SERVER_PATH=$AUTH_SERVER_PATH
# ARG JOB_SERVER_PATH
# ENV JOB_SERVER_PATH=$JOB_SERVER_PATH
# ARG INTERVIEW_SERVER_PATH
# ENV INTERVIEW_SERVER_PATH=$INTERVIEW_SERVER_PATH
# ARG FILE_SERVER_PATH
# ENV FILE_SERVER_PATH=$FILE_SERVER_PATH
# ARG APP_HOST_BASE_PATH
# ENV APP_HOST_BASE_PATH=$APP_HOST_BASE_PATH

ENV AUTH_SERVER_PATH=http://localhost:9010
ENV JOB_SERVER_PATH=http://localhost:9020
ENV INTERVIEW_SERVER_PATH=http://localhost:9030
ENV FILE_SERVER_PATH=http://localhost:9000
ENV APP_HOST_BASE_PATH=http://localhost:3000


# Expose port 3000 for development server
EXPOSE 3000

# Start the development server
CMD ["npm", "start"]