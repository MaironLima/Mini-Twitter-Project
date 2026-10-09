# Mini Twitter

```
backend/                     API em Java 26 puro (com.sun.net.httpserver + JDBC, sem framework)
mini-twitter-frontend-main/  Frontend React + Vite (inalterado)
docker-compose.yml           Postgres + backend
```

## Rodar com Docker

```bash
cp .env.example .env   # ajuste senha e JWT_SECRET
docker compose up -d --build
```

API em `http://localhost:3000`. Popular o banco com dados de exemplo:

```bash
docker compose exec backend java -cp out:lib/postgresql.jar Seed
```

## Rodar o backend local (sem Docker)

Requer JDK 26 e um Postgres acessível via `DATABASE_URL`.

```bash
cd backend
curl -Lo lib/postgresql.jar --create-dirs https://repo1.maven.org/maven2/org/postgresql/postgresql/42.7.14/postgresql-42.7.14.jar
javac -cp lib/postgresql.jar -d out src/*.java
DATABASE_URL=postgres://user:senha@localhost:5432/db JWT_SECRET=segredo java -cp "out:lib/postgresql.jar" Main
```

No Windows use `;` no classpath (`"out;lib/postgresql.jar"`). Teste rápido de Json/Jwt: `javac -d out src/*.java test/*.java && java -ea -cp out Check`.

## Variáveis de ambiente (backend)

| Variável       | Padrão                                                  |
|----------------|---------------------------------------------------------|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/postgres` |
| `JWT_SECRET`   | `super-secret-key`                                      |
| `PORT`         | `3000`                                                  |
| `RATE_LIMIT`   | `10` (requisições por minuto por IP)                    |

## Endpoints

| Método | Rota               | Auth | Descrição                          |
|--------|--------------------|------|------------------------------------|
| POST   | `/auth/register`   |      | `{name, email, password}`          |
| POST   | `/auth/login`      |      | `{email, password}` → `{token, user}` |
| POST   | `/auth/logout`     | ✓    | Invalida o token                   |
| GET    | `/posts?page=&search=` |  | Lista paginada (10 por página)     |
| POST   | `/posts`           | ✓    | `{title, content, image?}`         |
| PUT    | `/posts/:id`       | ✓    | Só o autor                         |
| DELETE | `/posts/:id`       | ✓    | Só o autor                         |
| POST   | `/posts/:id/like`  | ✓    | Alterna like → `{liked}`           |

Rate limit: 10 requisições/minuto por IP.
