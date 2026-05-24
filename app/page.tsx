export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <main className="mx-auto w-full max-w-5xl px-6 py-16 space-y-10">
        <header className="space-y-3">
          <p className="label-md">RateRecord</p>
          <h1 className="font-headline text-4xl md:text-5xl font-black tracking-tight">
            MVP de red social musical
          </h1>
          <p className="text-on-surface-variant max-w-2xl">
            Explora el feed, la biblioteca, los perfiles y los items del catalogo.
          </p>
        </header>
        <section className="grid gap-4 md:grid-cols-2">
          {["/feed", "/item/[type]/[id]", "/profile/[username]", "/library"].map(
            (route) => (
              <div
                key={route}
                className="rounded-2xl bg-surface-container-low p-6"
              >
                <p className="label-md">Ruta</p>
                <p className="font-headline text-lg font-bold">{route}</p>
              </div>
            )
          )}
        </section>
      </main>
    </div>
  );
}
