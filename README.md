# SnapBuy

SnapBuy is a full-stack e-commerce application built with a Spring Boot backend and an Angular frontend.

## Features
- User authentication and authorization using JWT
- Product browsing, search, deals, and categories
- Cart, wishlist, checkout, orders, and profile management
- Admin tools for products, users, and orders

## Project structure
- snapbuy/ecommerce-backend: Spring Boot REST API
- snapbuy/ecommerce-frontend: Angular single-page application

## Local development
### Backend
- Java 17+
- Maven
- Run from the backend folder:
  - mvn spring-boot:run

### Frontend
- Node.js 18+
- Run from the frontend folder:
  - npm install
  - npm start

## Deployment
### Docker
Build and run the backend container:
- docker build -t snapbuy-backend .
- docker run -p 8080:8080 --env-file .env snapbuy-backend

### Frontend hosting
The frontend is ready for Vercel or Netlify. Update the production API URL in:
- snapbuy/ecommerce-frontend/src/environments/environment.prod.ts

### Backend environment variables
Set these in your deployment environment:
- DB_URL
- DB_USERNAME
- DB_PASSWORD
- JWT_SECRET
- MAIL_USERNAME
- MAIL_PASSWORD
- SEED_DATA=false

