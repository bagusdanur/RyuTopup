"use client";

import { useState } from "react";
import { FiEdit2, FiSave, FiX, FiCheck, FiPower } from "react-icons/fi";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function GamesClient({ initialGames }: { initialGames: any[] }) {
  const [games, setGames] = useState(initialGames);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", developer: "", logo: "", cover: "" });
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleEdit = (game: any) => {
    setEditingId(game.id);
    setEditForm({
      name: game.name || "",
      developer: game.developer || "",
      logo: game.logo || "",
      cover: game.cover || "",
    });
  };

  const handleSave = async (id: string) => {
    setIsSaving(true);
    const supabase = createClient();
    
    // Update Supabase
    const { error } = await supabase
      .from("games")
      .update({
        name: editForm.name,
        developer: editForm.developer,
        logo: editForm.logo,
        cover: editForm.cover,
      })
      .eq("id", id);

    setIsSaving(false);

    if (error) {
      alert("Gagal menyimpan data game: " + error.message);
      return;
    }

    // Update local state
    setGames((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, ...editForm } : g
      )
    );
    setEditingId(null);
    router.refresh();
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const supabase = createClient();
    const newStatus = !currentStatus;
    
    // Update local state optimistic
    setGames((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, is_active: newStatus } : g
      )
    );

    const { error } = await supabase
      .from("games")
      .update({ is_active: newStatus })
      .eq("id", id);

    if (error) {
      // Revert if error
      alert("Gagal mengubah status: " + error.message);
      setGames((prev) =>
        prev.map((g) =>
          g.id === id ? { ...g, is_active: currentStatus } : g
        )
      );
    } else {
      router.refresh();
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* HEADER */}
      <div className="border-b-4 border-white pb-4 bg-accent p-6 text-black shadow-neo-lg">
        <h1 className="text-3xl font-black uppercase tracking-wider">
          Kelola Game
        </h1>
        <p className="font-bold text-sm mt-1 opacity-80">
          Ubah nama, publisher, dan gambar (logo/cover) dari game yang ada. Nonaktifkan game jika sedang gangguan.
        </p>
      </div>

      {/* GAMES TABLE */}
      <div className="bg-black border-4 border-white p-6 shadow-neo-lg overflow-x-auto rounded-none">
        <table className="w-full text-left min-w-[900px] border-collapse">
          <thead>
            <tr className="bg-white text-black text-xs font-black uppercase tracking-widest border-b-4 border-black">
              <th className="p-4 border-r-2 border-black w-[50px]">Cover</th>
              <th className="p-4 border-r-2 border-black w-48">Nama Game & Developer</th>
              <th className="p-4 border-r-2 border-black">URL Logo (Topup Page)</th>
              <th className="p-4 border-r-2 border-black">URL Cover (Beranda Grid)</th>
              <th className="p-4 border-r-2 border-black w-[100px] text-center">Status</th>
              <th className="p-4 text-center w-28">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-xs font-bold text-white bg-[#0a0a0a]">
            {games.map((g) => {
              const isEditing = editingId === g.id;

              return (
                <tr key={g.id} className="border-b-2 border-white/20 hover:bg-white/5 transition-colors">
                  {/* COVER THUMBNAIL */}
                  <td className="p-4">
                    <div className="w-12 h-16 bg-black border-2 border-white relative overflow-hidden">
                      {g.cover || g.logo ? (
                        <img src={isEditing ? editForm.cover : (g.cover || g.logo)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-white/10 flex items-center justify-center text-[10px]">No Img</div>
                      )}
                    </div>
                  </td>

                  {/* NAMA & DEVELOPER */}
                  <td className="p-4 space-y-2">
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full bg-black border-2 border-accent p-2 text-white outline-none mb-1 font-bold text-sm"
                          placeholder="Nama Game"
                        />
                        <input
                          type="text"
                          value={editForm.developer}
                          onChange={(e) => setEditForm({ ...editForm, developer: e.target.value })}
                          className="w-full bg-black border-2 border-accent p-2 text-white outline-none font-bold text-xs"
                          placeholder="Developer / Publisher"
                        />
                      </>
                    ) : (
                      <>
                        <div className="font-black text-sm text-accent uppercase tracking-wide">{g.name}</div>
                        <div className="text-white/60 font-bold uppercase text-[10px]">{g.developer || "Developer"}</div>
                      </>
                    )}
                  </td>

                  {/* LOGO URL */}
                  <td className="p-4">
                    {isEditing ? (
                      <textarea
                        value={editForm.logo}
                        onChange={(e) => setEditForm({ ...editForm, logo: e.target.value })}
                        className="w-full bg-black border-2 border-white p-2 text-white outline-none text-[10px] h-[50px] resize-none"
                        placeholder="https://... (URL gambar logo kecil)"
                      />
                    ) : (
                      <div className="text-[9px] font-mono text-white/50 break-all bg-white/5 p-2 border border-white/10 line-clamp-2" title={g.logo}>
                        {g.logo || "Kosong"}
                      </div>
                    )}
                  </td>

                  {/* COVER URL */}
                  <td className="p-4">
                    {isEditing ? (
                      <textarea
                        value={editForm.cover}
                        onChange={(e) => setEditForm({ ...editForm, cover: e.target.value })}
                        className="w-full bg-black border-2 border-white p-2 text-white outline-none text-[10px] h-[50px] resize-none"
                        placeholder="https://... (URL gambar cover panjang)"
                      />
                    ) : (
                      <div className="text-[9px] font-mono text-white/50 break-all bg-white/5 p-2 border border-white/10 line-clamp-2" title={g.cover}>
                        {g.cover || "Kosong"}
                      </div>
                    )}
                  </td>

                  {/* STATUS */}
                  <td className="p-4 text-center">
                    <button
                      onClick={() => toggleStatus(g.id, g.is_active)}
                      disabled={isEditing}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black font-black uppercase text-[10px] transition-all shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-50 ${
                        g.is_active ? "bg-accent-green text-black" : "bg-accent-red text-white"
                      }`}
                    >
                      <FiPower />
                      {g.is_active ? "Aktif" : "Mati"}
                    </button>
                  </td>

                  {/* AKSI */}
                  <td className="p-4 text-center">
                    {isEditing ? (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleSave(g.id)}
                          disabled={isSaving}
                          className="bg-accent text-black p-2 border-2 border-black shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-50"
                          title="Simpan"
                        >
                          <FiCheck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          disabled={isSaving}
                          className="bg-white text-black p-2 border-2 border-black shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-50"
                          title="Batal"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(g)}
                        className="bg-white text-black px-4 py-2 border-2 border-black font-black text-xs uppercase shadow-neo-sm hover:bg-accent hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all flex items-center justify-center mx-auto"
                        title="Edit Data"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
