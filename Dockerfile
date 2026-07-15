FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /workspace
COPY snapbuy/ecommerce-backend/pom.xml ./
COPY snapbuy/ecommerce-backend/src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /workspace/target/*.jar app.jar
EXPOSE 8080
ENV PORT=8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
