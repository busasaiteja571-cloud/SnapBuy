# SnapBuy (E-Commerce)

SnapBuy is a full-stack e-commerce application.

- **Backend:** Spring Boot (Java 17) with Spring Security + JWT, REST APIs, JPA/Hibernate, MySQL, and email notifications.
- **Frontend:** Angular 17 single-page application.

## Repo Structure

- `snapbuy/ecommerce-backend/` - Spring Boot backend
- `snapbuy/ecommerce-frontend/` - Angular frontend

## Backend

### Requirements

- Java 17+
- MySQL running (or configure another DB)

### Configure DB
Edit `snapbuy/ecommerce-backend/src/main/resources/application.properties`:

- `spring.datasource.url`
- `spring.datasource.username`
- `spring.datasource.password`

### Run
From `snapbuy/ecommerce-backend`:

- `mvn spring-boot:run`

Backend runs on: `http://localhost:8080`

## Frontend

### Requirements

- Node.js 18+

### Run
From `snapbuy/ecommerce-frontend`:

- `npm install`
- `npm start`

Frontend runs on: `http://localhost:4200`

## Notes

- JWT auth is implemented.
- Seed data exists via `DataSeeder` (roles, demo users, categories, products).

