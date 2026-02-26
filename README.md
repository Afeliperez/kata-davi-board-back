# kata-davi-board-back

Base backend con arquitectura hexagonal usando **Express + TypeScript + Jest**.

## Estructura

```text
src/
	application/
		ports/in/
		use-cases/
	adapters/
		in/http/
		out/persistence/
		out/security/
	config/
	domain/
		entities/
		repositories/
		services/
	main/
		httpDependencyInjection.ts
	app.ts
	server.ts

tests/
	unit/
	integration/
```

### Enfoque aplicado

- **Hexagonal**: controladores/rutas como adaptadores de entrada, repositorios/token como adaptadores de salida, casos de uso en aplicación.
- **SOLID**: puertos de entrada separados por contexto (`ListBoardsInputPort`, `UserInputPort`, `ProjectBoardInputPort`) y composición explícita en `main/httpDependencyInjection.ts`.
- **DRY**: eliminación de providers duplicados y centralización del cableado de dependencias en un solo punto.

## Scripts

- `npm run dev`: inicia servidor en modo desarrollo con nodemon.
- `npm run build`: compila TypeScript a `dist`.
- `npm start`: ejecuta versión compilada.
- `npm run lint`: analiza estilo/calidad con ESLint.
- `npm run lint:fix`: corrige problemas auto-reparables de ESLint.
- `npm test`: corre pruebas con Jest.

## Endpoints ejemplo

- `GET /health`
- `GET /boards`
- `POST /users`
- `GET /users/:cc`
- `PATCH /users/:cc`
- `DELETE /users/:cc`

## Arranque del servidor

Antes de levantar Express, el servidor valida conexión general a DynamoDB con `ListTables`.
Si la conexión o permisos fallan, la app termina con error.

## Variables de entorno

Se usa `dotenv` con configuración central en [src/config/env.ts](src/config/env.ts).

1. Crea un archivo `.env` en la raíz usando `.env.example` como base.
2. Variables disponibles:
	- `NODE_ENV`
	- `PORT`
	- `AWS_REGION`
	- `AWS_ACCESS_KEY_ID`
	- `AWS_SECRET_ACCESS_KEY`
	- `AWS_SESSION_TOKEN` (opcional)
	- `DYNAMODB_TABLE_NAME`
	- `CORS_ORIGIN`
