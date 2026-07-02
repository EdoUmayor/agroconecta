# 🌱 AgroConecta — Backend API

Plataforma Agrotech que permite a pequeños agricultores gestionar sus
**fincas**, **cultivos** y **cosechas** a través de una API REST.

Proyecto universitario desarrollado con arquitectura **monolítica**,
patrón **MVC** + **Repository Pattern**, **Node.js**, **Express**,
**PostgreSQL**, **Prisma ORM**, **Docker**, **Kubernetes** y **CI/CD** con
GitHub Actions.

📄 Documentación adicional:
- [Documento de arquitectura](./docs/architecture.md)
- [Diagramas C4](./docs/c4.md)
- [Despliegue Cloud y Kubernetes](./docs/cloud-kubernetes.md)

---

## 📁 Estructura del proyecto

```
agroconecta/
├── README.md
├── package.json
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── .github/workflows/deploy.yml
├── k8s/
│   ├── configmap.yaml
│   ├── postgres-deployment.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   └── hpa.yaml
├── docs/
│   ├── architecture.md
│   ├── c4.md
│   └── cloud-kubernetes.md
├── postman/
│   └── AgroConecta.postman_collection.json
├── prisma/
│   ├── schema.prisma
│   ├── seed.js
│   └── migrations/
│       └── 20260601000000_init/migration.sql
└── src/
    ├── app.js
    ├── server.js
    ├── config/          (db.js, swagger.js)
    ├── routes/          (farmer, farm, crop, harvest)
    ├── controllers/
    ├── services/
    ├── repositories/
    ├── middlewares/     (auth, validate, error)
    ├── validators/      (Zod)
    └── utils/           (ApiError, jwt)
```

## 🧱 Modelo de datos

```
Farmer (1) ───< Farm (1) ───< Crop (1) ───< HarvestRecord
```

- **Farmer**: agricultor registrado (nombre, email, password, teléfono).
- **Farm**: finca perteneciente a un agricultor (nombre, ubicación, hectáreas).
- **Crop**: cultivo sembrado en una finca (nombre, fecha de siembra, fecha
  esperada de cosecha, estado).
- **HarvestRecord**: registro de cosecha de un cultivo (fecha, kilos,
  calidad, notas).

---

## 🚀 Opción A: Ejecutar con Docker Compose (recomendado)

Requisitos: Docker y Docker Compose instalados.

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd agroconecta

# 2. Copiar variables de entorno
cp .env.example .env

# 3. Levantar backend + PostgreSQL con un solo comando
docker-compose up --build
```

Esto levanta:
- PostgreSQL en `localhost:5432`
- Backend en `http://localhost:3000`
- Al iniciar, el backend ejecuta automáticamente las migraciones de Prisma.

Para poblar la base con datos de ejemplo (opcional):
```bash
docker exec -it agroconecta_backend node prisma/seed.js
```

Para detener todo:
```bash
docker-compose down
```

Para detener y borrar también los datos de la base:
```bash
docker-compose down -v
```

---

## 💻 Opción B: Ejecutar localmente sin Docker

Requisitos: Node.js 20+, PostgreSQL 16 corriendo localmente.

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno y ajustar DATABASE_URL si es necesario
cp .env.example .env

# 3. Generar el cliente de Prisma
npx prisma generate

# 4. Crear las tablas en la base de datos (migraciones)
npx prisma migrate dev --name init

# 5. (Opcional) Poblar la base con datos de ejemplo
node prisma/seed.js

# 6. Levantar el servidor en modo desarrollo
npm run dev

# o en modo producción
npm start
```

El servidor quedará disponible en `http://localhost:3000`.

---

## 📖 Probar la API con Swagger

Con el servidor corriendo, abre en el navegador:

```
http://localhost:3000/api-docs
```

Ahí encontrarás los 16 endpoints documentados, agrupados por recurso
(Farmers, Farms, Crops, Harvests), con ejemplos de payloads.

**Flujo recomendado de prueba:**
1. `POST /api/farmers/register` — crea un agricultor y copia el `token` de
   la respuesta.
2. Haz clic en el botón **Authorize** (arriba a la derecha) y pega
   `Bearer <token>`.
3. Ya puedes probar `POST /api/farms`, `POST /api/crops`,
   `POST /api/harvests`, etc.

---

## 📬 Probar la API con Postman

1. Abre Postman.
2. Importa el archivo [`postman/AgroConecta.postman_collection.json`](./postman/AgroConecta.postman_collection.json).
3. Ejecuta la request **"1. Registrar agricultor"** o **"2. Login"**.
4. Copia el `token` de la respuesta y pégalo en la variable de colección
   `token` (o en el header `Authorization` de cada request protegida).
5. Ejecuta el resto de requests en orden.

---

## 🗄️ Crear/inspeccionar la base de datos manualmente

```bash
npx prisma migrate status   # Ver el estado de las migraciones
npx prisma studio           # Interfaz web en localhost:5555 para ver/editar datos
```

---

## ☸️ Desplegar en Kubernetes

Requisitos: un clúster de Kubernetes disponible (Minikube, Kind, Docker
Desktop con Kubernetes habilitado, o un clúster en la nube) y `kubectl`
configurado.

```bash
# 1. Crear el namespace, configuracion y secretos
kubectl apply -f k8s/configmap.yaml

# 2. Desplegar PostgreSQL
kubectl apply -f k8s/postgres-deployment.yaml

# 3. Desplegar el backend (3 replicas) y su Service
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# 4. (Opcional) Habilitar autoescalado
kubectl apply -f k8s/hpa.yaml

# 5. Verificar el estado
kubectl get pods -n agroconecta
kubectl get svc -n agroconecta
```

> Nota: antes de aplicar `deployment.yaml`, reemplaza la imagen
> `ghcr.io/tu-usuario/agroconecta-backend:latest` por la imagen que hayas
> construido y publicado (ver `.github/workflows/deploy.yml`), o cárgala
> directamente en tu clúster local con `minikube image load` / `kind load`.

Para ver los logs de un pod:
```bash
kubectl logs -f deployment/agroconecta-backend-deployment -n agroconecta
```

Más detalle sobre la arquitectura cloud propuesta en
[`docs/cloud-kubernetes.md`](./docs/cloud-kubernetes.md).

---

## ⚙️ CI/CD

El workflow [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml)
se ejecuta en cada push a `main`: instala dependencias, corre las
migraciones, verifica el arranque del servidor, construye la imagen Docker
y la publica en GHCR, y actualiza el despliegue en Kubernetes.

---

## 🔑 Variables de entorno

| Variable          | Descripción                                      |
|---------------------|----------------------------------------------------|
| `PORT`              | Puerto en el que corre el servidor (default 3000) |
| `DATABASE_URL`      | Cadena de conexión a PostgreSQL usada por Prisma    |
| `JWT_SECRET`        | Clave secreta para firmar los tokens JWT            |
| `JWT_EXPIRES_IN`    | Tiempo de expiración del token (ej: `1d`)          |
| `POSTGRES_USER`     | Usuario de PostgreSQL (usado por docker-compose)    |
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL (usado por docker-compose) |
| `POSTGRES_DB`       | Nombre de la base de datos                         |
