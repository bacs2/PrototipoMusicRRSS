import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { getCollectionPageData } from "@/services/queries";
import { getCurrentUserId } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { CollectionEditForm } from "./CollectionEditForm";

type Props = {
  params: Promise<{ username: string; id: string }>;
};

export default async function EditCollectionPage({ params }: Props) {
  const { username, id } = await params;
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect("/library");
  }

  // Fetch the creator to check ownership
  const supabase = supabaseServer();
  const { data: creator } = await supabase
    .from("Datos_usuario")
    .select("id")
    .eq("username", username)
    .single();

  if (!creator || creator.id !== userId) {
    return (
      <AppShell>
        <EmptyState
          title="Sin permiso"
          description="No puedes editar esta colección porque no eres el dueño."
        />
      </AppShell>
    );
  }

  const data = await getCollectionPageData(username, id);

  if (!data) {
    return (
      <AppShell>
        <EmptyState
          title="Colección no encontrada"
          description="No se encontró la colección."
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <p className="label-md mb-1">Editando</p>
          <h1 className="font-headline text-3xl font-black text-white">
            {data.nombre}
          </h1>
        </div>

        <CollectionEditForm
          username={username}
          collectionId={id}
          initialNombre={data.nombre}
          initialDescripcion={data.descripcion}
          initialItems={data.items.map((item) => ({
            item_type: item.item_type,
            item_id: item.item_id,
            title: item.title,
            subtitle: item.subtitle,
            imageUrl: item.imageUrl,
            annotation: item.annotation,
            must_listen: item.must_listen,
          }))}
        />
      </div>
    </AppShell>
  );
}
