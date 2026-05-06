# =============================================
# Backend Multi-stage Dockerfile
# Stage 1: Build JAR with Maven
# Stage 2: Run with lightweight JRE
# =============================================

# Stage 1: Build
FROM maven:3.9.9-eclipse-temurin-17 AS builder
WORKDIR /app

# Copy pom.xml first (for dependency caching)
COPY pom.xml ./

# Download dependencies (cached layer)
RUN mvn dependency:resolve -B

# Copy source code and build
COPY src/ src/
RUN mvn package -DskipTests -B

# Stage 2: Run
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy the built JAR from builder stage
COPY --from=builder /app/target/*.jar api-service.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "api-service.jar"]
