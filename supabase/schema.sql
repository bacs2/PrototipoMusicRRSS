create extension if not exists "pgcrypto";

create table if not exists "Datos_usuario" (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  nombre text,
  bio text,
  avatar_url text,
  password_hash text,
  created_at timestamptz not null default now()
);

create table if not exists "Seguidores_por_usuario" (
  id uuid primary key default gen_random_uuid(),
  seguidor_id uuid not null references "Datos_usuario" (id) on delete cascade,
  seguido_id uuid not null references "Datos_usuario" (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (seguidor_id, seguido_id)
);

create table if not exists "Artistas" (
  id uuid primary key default gen_random_uuid(),
  mbid text unique,
  nombre text not null,
  generos text[],
  avatar_url text,
  bio text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists "Albumes" (
  id uuid primary key default gen_random_uuid(),
  mbid text unique,
  artista_id uuid references "Artistas" (id) on delete set null,
  titulo text not null,
  fecha_lanzamiento date,
  generos text[],
  cover_url text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists "Canciones" (
  id uuid primary key default gen_random_uuid(),
  mbid text unique,
  artista_id uuid references "Artistas" (id) on delete set null,
  album_id uuid references "Albumes" (id) on delete set null,
  titulo text not null,
  duracion_ms integer,
  posicion integer not null default 0,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- Migration: add posicion to existing tables
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'Canciones' and column_name = 'posicion'
  ) then
    alter table "Canciones" add column posicion integer not null default 0;
  end if;
end $$;

create table if not exists "Resenas_de_usuario" (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references "Datos_usuario" (id) on delete cascade,
  item_type text not null check (item_type in ('artista', 'album', 'cancion')),
  item_id uuid not null,
  rating numeric(3,1) not null check (rating >= 0 and rating <= 10),
  comentario text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists "Coleccion_o_Lista" (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references "Datos_usuario" (id) on delete cascade,
  nombre text not null,
  descripcion text,
  -- items: array of { item_type: "artista"|"album"|"cancion", item_id: uuid, annotation?: text, must_listen?: text }
  -- Legacy format: { album_id: uuid, annotation?: text, must_listen?: text }
  items jsonb not null default '[]'::jsonb,
  cover_url text,
  created_at timestamptz not null default now()
);

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'Coleccion_o_Lista' and column_name = 'cover_url'
  ) then
    alter table "Coleccion_o_Lista" add column cover_url text;
  end if;
end $$;

create table if not exists "Biblioteca_usuario" (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references "Datos_usuario" (id) on delete cascade,
  item_type text not null check (item_type in ('artista', 'album', 'cancion')),
  item_id uuid not null,
  estado text,
  created_at timestamptz not null default now()
);

create table if not exists "Historial_de_reproduccion" (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references "Datos_usuario" (id) on delete cascade,
  item_type text not null check (item_type in ('artista', 'album', 'cancion')),
  item_id uuid not null,
  reproducido_en timestamptz not null default now()
);

create table if not exists "Wishlist" (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references "Datos_usuario" (id) on delete cascade,
  item_type text not null check (item_type in ('artista', 'album', 'cancion')),
  item_id uuid not null,
  created_at timestamptz not null default now(),
  unique (usuario_id, item_type, item_id)
);

create table if not exists "Perfiles_similares" (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references "Datos_usuario" (id) on delete cascade,
  similar_usuario_id uuid not null references "Datos_usuario" (id) on delete cascade,
  score numeric(5,2) not null default 0,
  created_at timestamptz not null default now(),
  unique (usuario_id, similar_usuario_id)
);

create index if not exists idx_datos_usuario_username on "Datos_usuario" (username);
create index if not exists idx_seguidores_seguidor on "Seguidores_por_usuario" (seguidor_id);
create index if not exists idx_seguidores_seguido on "Seguidores_por_usuario" (seguido_id);
create index if not exists idx_artistas_nombre on "Artistas" (nombre);
create index if not exists idx_albumes_titulo on "Albumes" (titulo);
create index if not exists idx_canciones_album on "Canciones" (album_id);
create index if not exists idx_canciones_titulo on "Canciones" (titulo);
create index if not exists idx_resenas_usuario on "Resenas_de_usuario" (usuario_id);
create index if not exists idx_resenas_item on "Resenas_de_usuario" (item_type, item_id);
create index if not exists idx_biblioteca_usuario on "Biblioteca_usuario" (usuario_id);
create index if not exists idx_historial_usuario on "Historial_de_reproduccion" (usuario_id);
create index if not exists idx_wishlist_usuario on "Wishlist" (usuario_id);
create index if not exists idx_perfiles_similares_usuario on "Perfiles_similares" (usuario_id);

alter table "Datos_usuario" enable row level security;
alter table "Seguidores_por_usuario" enable row level security;
alter table "Artistas" enable row level security;
alter table "Albumes" enable row level security;
alter table "Canciones" enable row level security;
alter table "Resenas_de_usuario" enable row level security;
alter table "Coleccion_o_Lista" enable row level security;
alter table "Biblioteca_usuario" enable row level security;
alter table "Historial_de_reproduccion" enable row level security;
alter table "Wishlist" enable row level security;
alter table "Perfiles_similares" enable row level security;

create policy "Datos_usuario_select" on "Datos_usuario"
  for select using (true);

create policy "Datos_usuario_insert" on "Datos_usuario"
  for insert with check (true);

create policy "Datos_usuario_update" on "Datos_usuario"
  for update using (auth.uid() = id);

create policy "Seguidores_select" on "Seguidores_por_usuario"
  for select using (true);

create policy "Seguidores_insert" on "Seguidores_por_usuario"
  for insert with check (auth.uid() = seguidor_id);

create policy "Seguidores_delete" on "Seguidores_por_usuario"
  for delete using (auth.uid() = seguidor_id);

create policy "Artistas_select" on "Artistas"
  for select using (true);

create policy "Albumes_select" on "Albumes"
  for select using (true);

create policy "Canciones_select" on "Canciones"
  for select using (true);

drop policy if exists "Artistas_insert" on "Artistas";
create policy "Artistas_insert" on "Artistas"
  for insert with check (true);

drop policy if exists "Albumes_insert" on "Albumes";
create policy "Albumes_insert" on "Albumes"
  for insert with check (true);

drop policy if exists "Canciones_insert" on "Canciones";
create policy "Canciones_insert" on "Canciones"
  for insert with check (true);

create policy "Resenas_select" on "Resenas_de_usuario"
  for select using (true);

create policy "Resenas_insert" on "Resenas_de_usuario"
  for insert with check (auth.uid() = usuario_id);

create policy "Resenas_update" on "Resenas_de_usuario"
  for update using (auth.uid() = usuario_id);

create policy "Resenas_delete" on "Resenas_de_usuario"
  for delete using (auth.uid() = usuario_id);

drop policy if exists "Colecciones_select" on "Coleccion_o_Lista";

create policy "Colecciones_select_own" on "Coleccion_o_Lista"
  for select using (auth.uid() = usuario_id);

drop policy if exists "Colecciones_select_public" on "Coleccion_o_Lista";

create policy "Colecciones_select_public" on "Coleccion_o_Lista"
  for select using (true);

create policy "Colecciones_insert" on "Coleccion_o_Lista"
  for insert with check (auth.uid() = usuario_id);

create policy "Colecciones_update" on "Coleccion_o_Lista"
  for update using (auth.uid() = usuario_id);

create policy "Colecciones_delete" on "Coleccion_o_Lista"
  for delete using (auth.uid() = usuario_id);

create policy "Biblioteca_select" on "Biblioteca_usuario"
  for select using (auth.uid() = usuario_id);

create policy "Biblioteca_insert" on "Biblioteca_usuario"
  for insert with check (auth.uid() = usuario_id);

create policy "Biblioteca_update" on "Biblioteca_usuario"
  for update using (auth.uid() = usuario_id);

create policy "Biblioteca_delete" on "Biblioteca_usuario"
  for delete using (auth.uid() = usuario_id);

create policy "Historial_select" on "Historial_de_reproduccion"
  for select using (auth.uid() = usuario_id);

create policy "Historial_insert" on "Historial_de_reproduccion"
  for insert with check (auth.uid() = usuario_id);

create policy "Wishlist_select" on "Wishlist"
  for select using (auth.uid() = usuario_id);

create policy "Wishlist_insert" on "Wishlist"
  for insert with check (auth.uid() = usuario_id);

create policy "Wishlist_delete" on "Wishlist"
  for delete using (auth.uid() = usuario_id);

create policy "Perfiles_similares_select" on "Perfiles_similares"
  for select using (auth.uid() = usuario_id);

create policy "Perfiles_similares_insert" on "Perfiles_similares"
  for insert with check (auth.uid() = usuario_id);

create policy "Perfiles_similares_update" on "Perfiles_similares"
  for update using (auth.uid() = usuario_id);

create policy "Perfiles_similares_delete" on "Perfiles_similares"
  for delete using (auth.uid() = usuario_id);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists resenas_updated_at on "Resenas_de_usuario";
create trigger resenas_updated_at
before update on "Resenas_de_usuario"
for each row execute procedure set_updated_at();

create or replace function add_posicion_column()
returns void as $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'Canciones' and column_name = 'posicion'
  ) then
    alter table "Canciones" add column posicion integer not null default 0;
  end if;
end;
$$ language plpgsql security definer;

create or replace function delete_canciones_by_album(p_album_id uuid)
returns void as $$
begin
  delete from "Canciones" where album_id = p_album_id;
end;
$$ language plpgsql security definer;

grant execute on function add_posicion_column() to anon, authenticated;
grant execute on function delete_canciones_by_album(uuid) to anon, authenticated;

-- Storage: collection covers
do $$ begin
  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values (
    'collection-covers',
    'collection-covers',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  )
  on conflict (id) do nothing;
end $$;

create policy if not exists "Collection covers are publicly readable"
  on storage.objects for select
  using (bucket_id = 'collection-covers');

create policy if not exists "Authenticated users can upload collection covers"
  on storage.objects for insert
  with check (
    bucket_id = 'collection-covers'
    and (auth.role() = 'authenticated' or auth.role() = 'service_role')
  );

create policy if not exists "Users can update own collection covers"
  on storage.objects for update
  using (
    bucket_id = 'collection-covers'
    and owner = auth.uid()
  );

create policy if not exists "Users can delete own collection covers"
  on storage.objects for delete
  using (
    bucket_id = 'collection-covers'
    and owner = auth.uid()
  );
