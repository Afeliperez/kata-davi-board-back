# kata-davi-board-back

Backend para gestión de **usuarios** y **project boards** (tableros de proyecto) con autenticación JWT, persistencia en DynamoDB y arquitectura hexagonal.

## ¿Qué hace este proyecto?

Este servicio expone una API HTTP para:

- Gestionar usuarios (`create`, `list`, `update`, `delete`).
- Autenticar usuarios con `login` y emisión de token JWT.
- Gestionar project boards (`create`, `list`, `getByPro`, `update`, `delete`).
- Filtrar project boards por código de acceso.

## Stack tecnológico

- **Node.js + TypeScript**
- **Express** (API HTTP)
- **AWS DynamoDB** con AWS SDK v3 (`@aws-sdk/lib-dynamodb`)
- **JWT + bcrypt** para autenticación y seguridad
- **Jest + Supertest** para pruebas unitarias y e2e
- **ESLint** para calidad de código

## Arquitectura aplicada

Se implementa **Arquitectura Hexagonal (Ports & Adapters)**:

- **Domain** (`src/domain`): entidades, contratos de repositorio y servicios de dominio.
- **Application** (`src/application`): casos de uso y puertos de entrada.
- **Adapters In** (`src/adapters/in`): controladores, rutas y middlewares HTTP.
- **Adapters Out** (`src/adapters/out`): repositorios DynamoDB, mappers y seguridad JWT.
- **Main** (`src/main`): composition root y ensamblado de dependencias.

### Flujo de ejecución

`HTTP Request -> Route -> Controller -> UseCase -> Repository -> DynamoDB`

## Patrones y técnicas de desarrollo utilizadas

- **Dependency Injection**: composición explícita en `src/main/httpDependencyInjection.ts`.
- **Repository Pattern**: acceso a datos encapsulado en repositorios (`DynamoDbUserRepository`, `DynamoDbProjectBoardRepository`).
- **Mapper Pattern**: transformación entre modelo dominio y modelo persistencia (`UserItemMapper`, `ProjectBoardItemMapper`).
- **Use Case Pattern (Application Service)**: orquestación de reglas de negocio por caso de uso.
- **Composition Root**: toda la construcción de objetos se concentra en una sola capa.

## Buenas prácticas implementadas

- **SOLID**
  - SRP: responsabilidades separadas por capas.
  - DIP: casos de uso dependen de interfaces, no de implementaciones concretas.
  - ISP: puertos de entrada separados por contexto.
- **DRY**: reutilización y centralización del wiring.
- **Manejo de errores robusto**: `try/catch` en operaciones async con `rethrowWithContext`.
- **Tipado estricto**: TypeScript en modo estricto.
- **Pruebas automatizadas**: cobertura con threshold global y validación de escenarios positivos/negativos.

## Estructura del proyecto

```text
src/
  application/
    ports/in/
    use-cases/
  adapters/
    in/http/
      controllers/
      middlewares/
      routes/
    out/
      persistence/dynamodb/
      security/
  config/
  domain/
    entities/
    repositories/
    services/
  main/
    httpDependencyInjection.ts
  shared/errors/
  app.ts
  server.ts

tests/
  unit/
  e2e/
```

## Seguridad y autenticación

- Se usa `Authorization: Bearer <token>` para rutas protegidas.
- La ruta de login está exenta del middleware de autenticación.
- Se validan casos de token inválido y token vencido.

## Endpoints

Base path configurable por `API_PATH` (por defecto: `kata-api`).

### Users

- `GET /{API_PATH}/users`
- `POST /{API_PATH}/users/login`
- `POST /{API_PATH}/users`
- `PUT /{API_PATH}/users/:cc`
- `DELETE /{API_PATH}/users/:cc`

### Project Boards

- `POST /{API_PATH}/project-boards`
- `GET /{API_PATH}/project-boards`
- `GET /{API_PATH}/project-boards/access/:accessCode`
- `GET /{API_PATH}/project-boards/:pro`
- `PUT /{API_PATH}/project-boards/:pro`
- `DELETE /{API_PATH}/project-boards/:pro`

## Scripts

- `npm run dev`: ejecuta en desarrollo con `nodemon + ts-node`.
- `npm run build`: compila TypeScript y resuelve aliases.
- `npm start`: ejecuta `dist/server.js`.
- `npm run lint`: análisis estático con ESLint.
- `npm run lint:fix`: correcciones automáticas de lint.
- `npm test`: pruebas con coverage.
- `npm run test:e2e`: suite e2e principal con Supertest.
- `npm run test:coverage`: ejecución explícita de cobertura para CI.

## Arranque del servidor

Antes de iniciar Express, el servidor valida conectividad con DynamoDB mediante `ListTables`.
Si falla la validación, el proceso lanza error y no inicia el listener.

## Variables de entorno

Configuración centralizada en `src/config/env.ts`.

- `NODE_ENV`
- `PORT`
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `DYNAMODB_ENDPOINT` (opcional para local/dev)
- `DYNAMODB_USERS_TABLE_NAME`
- `DYNAMODB_PROJECT_BOARD_TABLE_NAME`
- `API_PATH`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

## Testing

- Pruebas unitarias separadas por responsabilidad (use-cases, controllers, repositorios, mappers, config).
- Pruebas e2e con Supertest para flujos HTTP completos.
- Threshold global de cobertura configurado en Jest.
