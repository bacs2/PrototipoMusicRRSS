Actúa como un Desarrollador Full-Stack Senior experto en React, Next.js y bases de datos relacionales. Tu tarea es escribir el código y la estructura para el MVP de una red social musical (tipo "Letterboxd para música").



A continuación, te detallo los requerimientos técnicos. Debes generar el código paso a paso, asegurando buenas prácticas, modularidad y un diseño responsivo.



### 1. STACK TECNOLÓGICO OBLIGATORIO

- Frontend: Next.js (App Router), React, Tailwind CSS.

- Componentes UI: shadcn/ui o Radix UI (para un desarrollo ágil y moderno).

- Backend & Base de Datos: Supabase (PostgreSQL, Autenticación y Row Level Security).

- Generación de Imágenes (Post para redes): `html-to-image` o `@vercel/satori` (para convertir el componente de reseña en una imagen compartible).

- Datos Musicales: Integración con API externa (ej. Spotify o MusicBrainz) para consumir la metadata musical.



### 2. MODELO DE DATOS REQUERIDO (ESTRICTO)

El sistema debe estructurarse utilizando EXACTAMENTE los siguientes conceptos de datos. Define las tablas relacionales basadas en estos nombres:

1. `Datos_usuario`: Información de perfil y autenticación.

2. `Seguidores_por_usuario`: Relación de quién sigue a quién.

3. `Artistas`: Entidad del catálogo musical.

4. `Albumes`: Entidad del catálogo musical.

5. `Canciones`: Entidad del catálogo musical.

6. `Resenas_de_usuario`: Almacena la puntuación y el comentario sobre artistas, álbumes o canciones.

7. `Coleccion_o_Lista`: Listas creadas por el usuario que agrupan artistas o álbumes.

8. `Biblioteca_usuario`: Contenedor general de lo que el usuario ha guardado o interactuado.

9. `Historial_de_reproduccion`: Registro de las escuchas del usuario.

10. `Wishlist`: Elementos guardados para escuchar más tarde.

11. `Perfiles_similares`: Tabla o vista materializada para recomendaciones sociales.



### 3. FUNCIONALIDADES CORE (LÓGICA DE NEGOCIO)

- Autenticación: Sistema completo de login/registro.

- Puntuación y Comentarios: CRUD sobre la tabla `Resenas_de_usuario`.

- Creación de Colecciones: Capacidad de generar `Coleccion_o_Lista` agregando `Artistas` o `Albumes`.

- Creación de Post (Exportación Social): Al puntuar o comentar, el frontend debe tomar la UI de esa reseña y generar una imagen/tarjeta descargable para compartir en redes sociales.

- Feed Orgánico: Un muro que muestre las interacciones (reseñas e historial de reproducción) estrictamente de los usuarios seguidos (cruzando `Resenas_de_usuario`, `Historial_de_reproduccion` y `Seguidores_por_usuario`).



### 4. VISTAS REQUERIDAS (RUTAS DE NEXT.JS)

Implementa la estructura SOLO para las siguientes 4 pantallas clave:

1. `/feed`: Muro inicial que muestra comentarios y escuchas de las personas a las que sigues.

2. `/item/[type]/[id]`: Plantilla única para mostrar información de Artistas o Álbumes. Debe incluir: metadata, géneros, puntuación global y listado de reseñas.

3. `/profile/[username]`: Perfil del usuario mostrando sus datos y actividad reciente.

4. `/library`: Biblioteca personal del usuario, mostrando sus colecciones, wishlist e historial.

