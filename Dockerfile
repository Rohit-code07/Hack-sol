# Build Stage for KisanSetu Spring Boot Backend
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Copy pom.xml and download dependencies
COPY Backend/pom.xml ./Backend/
WORKDIR /app/Backend
RUN mvn dependency:go-offline -B || true

# Copy source code and package application
COPY Backend/src ./src
RUN mvn clean package -DskipTests -B

# Runtime Stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Run as non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy built artifact
COPY --from=builder /app/Backend/target/kisansetu-backend-1.0.0-SNAPSHOT.jar app.jar

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8080
ENV PORT=8080 \
    JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC"

ENTRYPOINT ["sh", "-c", "if [ -n \"$MYSQL_URL\" ] && [ \"${MYSQL_URL#jdbc:}\" = \"$MYSQL_URL\" ]; then export SPRING_DATASOURCE_URL=\"jdbc:$MYSQL_URL\"; elif [ -n \"$DATABASE_URL\" ] && [ \"${DATABASE_URL#jdbc:}\" = \"$DATABASE_URL\" ]; then export SPRING_DATASOURCE_URL=\"jdbc:$DATABASE_URL\"; fi; exec java $JAVA_OPTS -Dserver.port=${PORT:-8080} -Djava.security.egd=file:/dev/./urandom -jar app.jar"]
