# Node.js + MongoDB REST API

This project is a REST API built with Node.js and MongoDB. The API allows for creating and retrieving posts with tags, along with sorting, filtering, and pagination capabilities.

## Prerequisites

Ensure you have the following installed on your machine:
- Node.js
- Docker

## Docker Container Start

 Run the following command after starting your Docker Desktop:

- docker-compose up -d


## Environment Variables

Create a `.env` file in the root of the project with the following content:

PORT=3000
MONGO_URI=mongodb://mongo:27017/node-mongo-api

## Start the Server

- npm run dev

