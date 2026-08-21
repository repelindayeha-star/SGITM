# --- Etapa 1: compilar con Maven + JDK 21 dentro del contenedor ---
# Se usa el JDK del contenedor (no el de la maquina host) a proposito: asi el build
# no depende de que quien lo corra tenga instalado exactamente JDK 21 -- evita el
# problema real que tuvimos con Lombok + JDK 25 en la maquina de desarrollo.
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B -q package -DskipTests

# --- Etapa 2: imagen final, solo el JRE + el jar ya compilado ---
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

RUN addgroup --system spring && adduser --system --ingroup spring spring
USER spring:spring

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
