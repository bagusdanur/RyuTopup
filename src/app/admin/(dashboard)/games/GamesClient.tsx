"use client";

import { useState } from "react";
import { FiEdit2, FiSave, FiX, FiCheck, FiPower } from "react-icons/fi";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function GamesClient({ initialGames }: { initialGames: any[] }) {
  const [games, setGames] = useState(initialGames);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", developer: "", logo: "", cover: "" });
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", developer: "", logo: "", cover: "", preset: "ff" });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const router = useRouter();

  const PRESET_FIELDS: Record<string, any[]> = {
    ml: [{ id: "uid", label: "User ID", placeholder: "123456789" }, { id: "server", label: "Zone ID", placeholder: "1234" }],
    ff: [{ id: "uid", label: "Player ID", placeholder: "123456789" }],
    genshin: [{ id: "uid", label: "UID", placeholder: "800000000" }, { id: "server", label: "Server", placeholder: "Asia" }],
    custom: [{ id: "uid", label: "ID Akun", placeholder: "12345678" }]
  };

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
    setEditingId(null);
    router.refresh();
  };

  const handleAdd = async () => {
    if (!addForm.name) return alert("Nama game harus diisi");
    
    setIsSaving(true);
    const supabase = createClient();
    const slug = addForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    
    const { data, error } = await supabase
      .from("games")
      .insert({
        name: addForm.name,
        slug: slug,
        developer: addForm.developer,
        logo: addForm.logo,
        cover: addForm.cover,
        fields: PRESET_FIELDS[addForm.preset] || PRESET_FIELDS.custom,
        is_active: true
      })
      .select()
      .single();

    setIsSaving(false);

    if (error) {
      alert("Gagal menambah game: " + error.message);
      return;
    }

    setGames((prev) => [data, ...prev]);
    setShowAddModal(false);
    setAddForm({ name: "", developer: "", logo: "", cover: "", preset: "ff" });
    router.refresh();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`YAKIN HAPUS PERMANEN GAME "${name}"? Semua produk di dalamnya juga akan terhapus.`)) return;
    
    setIsDeleting(id);
    const supabase = createClient();
    const { error } = await supabase.from("games").delete().eq("id", id);
    setIsDeleting(null);

    if (error) {
      alert("Gagal menghapus game: " + error.message);
      return;
    }

    setGames((prev) => prev.filter((g) => g.id !== id));
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
      <div className="border-b-4 border-white pb-4 bg-accent p-6 text-black shadow-neo-lg flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wider">
            Kelola Game
          </h1>
          <p className="font-bold text-sm mt-1 opacity-80">
            Ubah nama, publisher, dan gambar (logo/cover) dari game yang ada. Nonaktifkan game jika sedang gangguan.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-black text-white px-6 py-3 border-4 border-black font-black uppercase shadow-neo hover:bg-white hover:text-black transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
        >
          + Tambah Game
        </button>
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0a0a0a] border-4 border-accent p-6 w-full max-w-lg shadow-neo-lg text-white">
            <h2 className="text-2xl font-black uppercase tracking-wider text-accent mb-6 border-b-2 border-white/20 pb-4">Tambah Game Baru</h2>
            
            <div className="space-y-4 font-bold text-sm">
              <div>
                <label className="block text-white/70 mb-1">Nama Game</label>
                <input type="text" value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})} className="w-full bg-black border-2 border-white p-3 focus:border-accent outline-none transition-colors" placeholder="Contoh: Mobile Legends" />
              </div>
              <div>
                <label className="block text-white/70 mb-1">Developer / Publisher</label>
                <input type="text" value={addForm.developer} onChange={e => setAddForm({...addForm, developer: e.target.value})} className="w-full bg-black border-2 border-white p-3 focus:border-accent outline-none transition-colors" placeholder="Contoh: Moonton" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 mb-1">URL Logo (Topup Page)</label>
                  <textarea value={addForm.logo} onChange={e => setAddForm({...addForm, logo: e.target.value})} className="w-full bg-black border-2 border-white p-3 h-20 focus:border-accent outline-none transition-colors" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-white/70 mb-1">URL Cover (Beranda)</label>
                  <textarea value={addForm.cover} onChange={e => setAddForm({...addForm, cover: e.target.value})} className="w-full bg-black border-2 border-white p-3 h-20 focus:border-accent outline-none transition-colors" placeholder="https://..." />
                </div>
              </div>
              <div>
                <label className="block text-white/70 mb-1">Gaya Input Form Pelanggan</label>
                <select value={addForm.preset} onChange={e => setAddForm({...addForm, preset: e.target.value})} className="w-full bg-black border-2 border-white p-3 focus:border-accent outline-none transition-colors cursor-pointer text-white">
                  <option value="ml">Mobile Legends (User ID + Zone ID)</option>
                  <option value="genshin">Genshin/HSR (UID + Server Dropdown)</option>
                  <option value="ff">Free Fire/PUBG/Valorant (Hanya Player ID 1 Kolom)</option>
                  <option value="custom">Lainnya (ID Akun Default)</option>
                </select>
                <p className="text-xs text-white/50 mt-1 font-normal">Gaya form input yang akan ditampilkan saat pembeli klik game ini.</p>
              </div>
            </div>

            <div className="mt-8 flex gap-4 justify-end">
              <button onClick={() => setShowAddModal(false)} className="px-6 py-2 border-2 border-white hover:bg-white hover:text-black font-black uppercase transition-all">Batal</button>
              <button onClick={handleAdd} disabled={isSaving} className="px-6 py-2 bg-accent text-black border-2 border-accent hover:bg-accent-hover font-black uppercase transition-all flex items-center gap-2">
                {isSaving ? "Menyimpan..." : "Simpan Game"}
              </button>
            </div>
          </div>
        </div>
      )}

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
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(g)}
                          className="bg-white text-black p-2 border-2 border-black shadow-neo-sm hover:bg-accent hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                          title="Edit Data"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(g.id, g.name)}
                          disabled={isDeleting === g.id}
                          className="bg-accent-red text-white p-2 border-2 border-black shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all disabled:opacity-50"
                          title="Hapus Game"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
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
