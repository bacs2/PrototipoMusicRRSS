"use client";

import { useState } from "react";
import { CreateCollectionModal } from "./CreateCollectionModal";
import { Plus } from "lucide-react";

export function CreateCollectionButton({ username }: { username: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-full bg-gradient-to-r from-primary to-primary-dim px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity flex items-center gap-1.5"
      >
        <Plus className="w-4 h-4" />
        Create Collection
      </button>

      {isOpen ? (
        <CreateCollectionModal username={username} onClose={() => setIsOpen(false)} />
      ) : null}
    </>
  );
}
