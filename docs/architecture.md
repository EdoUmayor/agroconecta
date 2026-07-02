# Documento de Arquitectura — AgroConecta

## 1. Idea de negocio

**AgroConecta** es una plataforma Agrotech que permite a pequeños agricultores
llevar el control digital de sus **fincas**, los **cultivos** que siembran en
ellas y las **cosechas** que obtienen. Hoy en día muchos pequeños productores
registran esta información en cuadernos físicos o planillas sueltas, lo que
dificulta el seguimiento histórico, la toma de decisiones y el acceso a
créditos o subsidios agrícolas (que suelen exigir historial productivo).

AgroConecta resuelve este problema ofreciendo una API REST donde el
agricultor puede:

- Registrarse y autenticarse de forma segura.
- Administrar sus fincas (ubicación, tamaño en hectáreas).
- Registrar los cultivos plantados en cada finca y su estado
  (`PLANTED`, `GROWING`, `READY_TO_HARVEST`, `HARVESTED`).
- Registrar cosechas (cantidad en kg, calidad, fecha) asociadas a cada cultivo.

## 2. Requisitos no funcionales y su relación con la arquitectura

Más allá de las funcionalidades (CRUD de fincas, cultivos y cosechas), el
diseño técnico responde a requisitos no funcionales concretos del negocio:

| Requisito no funcional | Decisión de arquitectura que lo atiende |
|---|---|
| **Seguridad** | Contraseñas con hash `bcrypt` (nunca texto plano); autenticación stateless con JWT firmado; secretos (`JWT_SECRET`, credenciales de BD) aislados en variables de entorno (`.env`) y en `Secret` de Kubernetes, nunca en el código fuente; autorización a nivel de servicio (un agricultor no puede leer/editar recursos de otro, ver `farm.service.js`). |
| **Disponibilidad** | El `Deployment` de Kubernetes corre **3 réplicas** del backend con `readinessProbe`/`livenessProbe` sobre `/health`, de modo que un Pod caído no tumba el servicio; el `Service` balancea el tráfico entre las réplicas sanas. |
| **Escalabilidad** | `HorizontalPodAutoscaler` (`k8s/hpa.yaml`) escala horizontalmente entre 3 y 8 réplicas según uso de CPU; la capa de servicios/repositorios es *stateless* (no guarda estado en memoria), por lo que cualquier réplica puede atender cualquier petición sin afinidad de sesión. |
| **Mantenibilidad** | Separación en capas (rutas → controladores → servicios → repositorios) permite modificar una capa sin romper las demás; validación centralizada con Zod evita lógica de validación duplicada; manejo de errores centralizado (`error.middleware.js`) da consistencia a las respuestas de error. |
| **Portabilidad / reproducibilidad** | Docker (build multi-stage) garantiza que el entorno de ejecución sea idéntico en desarrollo, CI y producción; Prisma con migraciones versionadas asegura que el esquema de base de datos sea reproducible en cualquier entorno con un solo comando. |
| **Observabilidad mínima** | Endpoint `/health` usado por Docker (`HEALTHCHECK`) y Kubernetes (probes); logging de peticiones HTTP con `morgan` en cada request. |

Estos requisitos no funcionales son los que justifican, en conjunto, por qué
se combinó un monolito modular (simplicidad operativa) con Kubernetes
(disponibilidad y escalabilidad): se prioriza la robustez del sistema en
producción sin pagar el costo de coordinación de microservicios que el
negocio, en esta etapa, no necesita.

## 3. Patrón arquitectónico: MVC + Repository Pattern

El backend implementa el patrón **Modelo-Vista-Controlador (MVC)** adaptado a
una API REST (sin vistas HTML, la "vista" es la representación JSON):

- **Modelo**: definido declarativamente en `prisma/schema.prisma`. Representa
  las entidades del dominio (`Farmer`, `Farm`, `Crop`, `HarvestRecord`) y sus
  relaciones.
- **Controlador** (`src/controllers/*`): recibe la petición HTTP, delega la
  lógica al servicio correspondiente y da forma a la respuesta HTTP
  (código de estado + JSON). No contiene lógica de negocio ni acceso a datos.
- **Vista**: en una API REST la "vista" es el propio JSON serializado que
  retorna el controlador.

Sobre esta base se añade una capa adicional, el **Repository Pattern**:

- **Servicio** (`src/services/*`): contiene la lógica de negocio (reglas de
  autorización, validaciones cruzadas entre entidades, orquestación).
- **Repositorio** (`src/repositories/*`): es la única capa que conoce Prisma
  y ejecuta consultas SQL a través del ORM. Si en el futuro se cambia
  PostgreSQL por otro motor, solo esta capa se modifica.

```
Cliente HTTP
    │
    ▼
Rutas (Express Router) ──> valida entrada (Zod) ──> valida JWT
    │
    ▼
Controlador  (HTTP in/out)
    │
    ▼
Servicio     (reglas de negocio)
    │
    ▼
Repositorio  (acceso a datos vía Prisma)
    │
    ▼
PostgreSQL
```

Esta separación en capas cumple el **Principio de Responsabilidad Única**:
cada capa tiene un motivo de cambio distinto, lo que facilita el
mantenimiento, las pruebas unitarias y la incorporación de nuevos
desarrolladores al equipo.

## 4. ¿Por qué monolito y no microservicios?

Se eligió una **arquitectura monolítica modular** en lugar de microservicios
por las siguientes razones:

1. **Tamaño y alcance del proyecto**: el dominio tiene 4 entidades
   fuertemente relacionadas (un agricultor tiene fincas, que tienen cultivos,
   que tienen cosechas). Dividir esto en microservicios introduciría
   comunicación de red innecesaria (llamadas HTTP o mensajería entre
   servicios) para operaciones que hoy son simples `JOIN`s de base de datos.
2. **Complejidad operativa**: los microservicios exigen orquestación
   (service discovery, API gateway, tracing distribuido, manejo de
   transacciones distribuidas), infraestructura que no aporta valor a un
   proyecto académico y que consumiría el tiempo disponible sin mejorar la
   nota en los criterios evaluados.
3. **Equipo pequeño**: microservicios brillan cuando distintos equipos
   pueden desplegar de forma independiente. En un proyecto universitario con
   pocos integrantes, esta ventaja no aplica y solo se traduce en más
   configuración (múltiples repos, múltiples pipelines, múltiples bases de
   datos).
4. **Consistencia transaccional**: al registrar una cosecha, el sistema
   también actualiza el estado del cultivo asociado. En un monolito esto es
   una transacción local simple; en microservicios requeriría patrones como
   Saga, que agregan complejidad sin beneficio real aquí.
5. **Camino de evolución**: el monolito está diseñado de forma **modular**
   (rutas, controladores, servicios y repositorios separados por dominio).
   Si en el futuro creciera el negocio, cada módulo (`farmer`, `farm`,
   `crop`, `harvest`) podría extraerse como microservicio independiente sin
   reescribir la lógica de negocio, solo cambiando la capa de transporte.

En resumen: se prioriza **simplicidad, velocidad de desarrollo y facilidad de
despliegue**, sin sacrificar buenas prácticas de separación de
responsabilidades a nivel de código.

## 5. ¿Por qué REST?

Se eligió **REST sobre HTTP** porque:

- Es el estándar más ampliamente soportado y entendido, ideal para un
  contexto académico donde se debe demostrar dominio de conceptos HTTP
  (verbos, códigos de estado, idempotencia).
- Se integra naturalmente con **Swagger/OpenAPI** para generar documentación
  interactiva, un requisito del proyecto.
- Los recursos del dominio (`farmers`, `farms`, `crops`, `harvests`) mapean
  de forma natural a rutas REST (`/api/farms/:id`) y verbos HTTP
  (`GET`, `POST`, `PUT`, `DELETE`).
- No se requiere la flexibilidad de consultas de GraphQL ni la eficiencia de
  streaming de gRPC; REST es la opción más simple que cumple todos los
  requisitos.

## 6. SPA vs MPA — Justificación del frontend

El foco del proyecto es el **backend**. La rúbrica permite un frontend
mínimo, por lo que se optó por **Swagger UI** como interfaz de prueba
principal (disponible en `/api-docs`), complementado con una colección de
Postman.

Si se quisiera construir un frontend real a futuro, se recomendaría una
**SPA (Single Page Application)** con React o Vue, en lugar de una MPA
(Multi Page Application), porque:

- La API ya está diseñada como un servicio REST desacoplado (stateless,
  autenticación por JWT), lo cual encaja naturalmente con el modelo de
  consumo de una SPA (fetch/axios + manejo de estado en el cliente).
- Una SPA ofrece mejor experiencia de usuario (sin recargas de página) para
  flujos tipo dashboard, como el que tendría un agricultor revisando sus
  fincas y cultivos.
- Al mantener el backend 100% independiente del frontend, se preserva la
  posibilidad de tener múltiples clientes (web, móvil) consumiendo la misma
  API sin cambios.

Una MPA (renderizado en servidor con plantillas) habría acoplado
innecesariamente la lógica de presentación al backend, contradiciendo el
objetivo de exponer una API REST reutilizable.

## 7. Diseño REST — Endpoints principales

| Método | Endpoint                | Descripción                              | Auth |
|--------|--------------------------|-------------------------------------------|------|
| POST   | `/api/farmers/register`  | Registrar un nuevo agricultor             | No   |
| POST   | `/api/farmers/login`     | Iniciar sesión y obtener JWT              | No   |
| GET    | `/api/farmers/me`        | Ver perfil del agricultor autenticado     | Sí   |
| GET    | `/api/farms`             | Listar fincas del agricultor              | Sí   |
| POST   | `/api/farms`             | Crear una finca                           | Sí   |
| GET    | `/api/farms/:id`         | Obtener una finca por ID                  | Sí   |
| PUT    | `/api/farms/:id`         | Actualizar una finca                      | Sí   |
| DELETE | `/api/farms/:id`         | Eliminar una finca                        | Sí   |
| POST   | `/api/crops`             | Crear un cultivo                          | Sí   |
| GET    | `/api/crops`             | Listar cultivos (filtro opcional `farmId`)| Sí   |
| PUT    | `/api/crops/:id`         | Actualizar un cultivo                     | Sí   |
| DELETE | `/api/crops/:id`         | Eliminar un cultivo                       | Sí   |
| POST   | `/api/harvests`          | Registrar una cosecha                     | Sí   |
| GET    | `/api/harvests`          | Listar cosechas (filtro opcional `cropId`)| Sí   |
| PUT    | `/api/harvests/:id`      | Actualizar un registro de cosecha         | Sí   |
| DELETE | `/api/harvests/:id`      | Eliminar un registro de cosecha           | Sí   |

En total: **16 endpoints**, superando ampliamente el mínimo de 5 requerido.

### Ejemplo de payload — `POST /api/farms`

Request:
```json
{
  "name": "Finca El Rosal",
  "location": "Curico, Region del Maule, Chile",
  "sizeHa": 12.5
}
```

Response `201 Created`:
```json
{
  "success": true,
  "message": "Finca creada con exito",
  "data": {
    "id": 1,
    "name": "Finca El Rosal",
    "location": "Curico, Region del Maule, Chile",
    "sizeHa": 12.5,
    "farmerId": 3,
    "createdAt": "2026-06-01T14:32:00.000Z",
    "updatedAt": "2026-06-01T14:32:00.000Z"
  }
}
```

### Ejemplo de error — `404 Not Found`
```json
{
  "success": false,
  "message": "Finca no encontrada"
}
```

### Códigos HTTP utilizados

| Código | Significado             | Cuándo se usa                                   |
|--------|--------------------------|--------------------------------------------------|
| 200    | OK                       | Lecturas y actualizaciones exitosas               |
| 201    | Created                  | Creación exitosa de un recurso                    |
| 204    | No Content               | Eliminación exitosa (sin cuerpo de respuesta)     |
| 400    | Bad Request              | Error de validación de payload (Zod)              |
| 401    | Unauthorized             | Token ausente, inválido o expirado                |
| 403    | Forbidden                | El recurso existe pero no pertenece al usuario    |
| 404    | Not Found                | El recurso no existe                              |
| 409    | Conflict                 | Email duplicado u otra violación de unicidad      |
| 500    | Internal Server Error    | Error inesperado del servidor                     |

## 8. Diagramas C4

Ver archivo [`c4.md`](./c4.md) para los diagramas de Contexto (Nivel 1) y
Contenedores (Nivel 2) en formato Mermaid.

## 9. Stack tecnológico

| Capa            | Tecnología           | Justificación                                             |
|------------------|-----------------------|--------------------------------------------------------------|
| Runtime          | Node.js 20            | Rápido de desarrollar, gran ecosistema, ideal para REST APIs |
| Framework HTTP   | Express               | Minimalista, estándar de facto para APIs REST en Node        |
| Base de datos    | PostgreSQL 16         | Relacional, robusta, ideal para datos estructurados con relaciones (Farmer→Farm→Crop→Harvest) |
| ORM              | Prisma                | Migraciones versionadas, type-safety, DX excelente            |
| Validación       | Zod                   | Esquemas declarativos, mensajes de error claros               |
| Auth             | JWT + bcryptjs         | Stateless, estándar de la industria para APIs REST            |
| Documentación    | Swagger (OpenAPI 3.0)  | Documentación interactiva y ejecutable, requisito del curso   |
| Contenedores     | Docker / Docker Compose| Empaquetado reproducible del backend + base de datos          |
| Orquestación     | Kubernetes             | Réplicas, autoescalado y despliegues sin downtime             |
| CI/CD            | GitHub Actions         | Integrado nativamente al repositorio, gratuito para proyectos académicos |
