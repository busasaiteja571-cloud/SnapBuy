# SnapBuy

SnapBuy is a full-stack e-commerce application with a Spring Boot backend and an Angular frontend.

## Project structure
- snapbuy/ecommerce-backend - Spring Boot REST API
- snapbuy/ecommerce-frontend - Angular UI

## Deployment notes
- Frontend can be deployed to Vercel or Netlify.
- Backend should be deployed to a Java hosting service such as Render, Railway, Fly.io, or Azure App Service.
- Set these environment variables for the backend:
  - DB_URL
  - DB_USERNAME
  - DB_PASSWORD
  - JWT_SECRET
  - MAIL_USERNAME
  - MAIL_PASSWORD
  - SEED_DATA=false
- Update the frontend environment file at snapbuy/ecommerce-frontend/src/environments/environment.prod.ts with the deployed backend URL.
