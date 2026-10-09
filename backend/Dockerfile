FROM eclipse-temurin:26-jdk-alpine AS build
WORKDIR /app
ADD https://repo1.maven.org/maven2/org/postgresql/postgresql/42.7.14/postgresql-42.7.14.jar lib/postgresql.jar
COPY src src
RUN javac -cp lib/postgresql.jar -d out src/*.java

FROM eclipse-temurin:26-jre-alpine
WORKDIR /app
COPY --from=build /app/lib lib
COPY --from=build /app/out out
EXPOSE 3000
CMD ["java", "-cp", "out:lib/postgresql.jar", "Main"]
