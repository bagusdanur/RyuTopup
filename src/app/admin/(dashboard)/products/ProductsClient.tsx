"use client";

import { useState } from "react";
import { FiEdit2, FiSave, FiX, FiCheck } from "react-icons/fi";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ProductsClient({ initialGames, initialProducts }: { initialGames: any[], initialProducts: any[] }) {
  const [selectedGame, setSelectedGame] = useState(initialGames[0]?.id || "");
  const [products, setProducts] = useState(initialProducts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ price: 0, original_price: 0, discount: "", is_flash_sale: false });
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setEditForm({
      price: product.price,
      original_price: product.original_price,
      discount: product.discount || "",
      is_flash_sale: product.is_flash_sale || false,
    });
  };

  const handleSave = async (id: string) => {
    setIsSaving(true);
    const supabase = createClient();
    
    // Update Supabase
    const { error } = await supabase
      .from("products")
      .update({
        price: editForm.price,
        original_price: editForm.original_price,
        discount: editForm.discount,
        is_flash_sale: editForm.is_flash_sale,
      })
      .eq("id", id);

    setIsSaving(false);

    if (error) {
      alert("Gagal menyimpan harga: " + error.message);
      return;
    }

    // Update local state
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, ...editForm } : p
      )
    );
    setEditingId(null);
    router.refresh(); // Refresh Next.js server cache to reflect everywhere
  };

  const filteredProducts = products.filter(p => p.game_id === selectedGame);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* HEADER */}
      <div className="border-b-2 border-white pb-4">
        <h1 className="text-2xl font-black text-white uppercase tracking-wider">
          Kelola Harga & Diskon
        </h1>
        <p className="text-white/60 font-bold text-xs mt-1">
          Pembaruan harga di sini akan langsung mengubah harga di website utama pengunjung secara instan (real-time).
        </p>
      </div>

      {/* GAME SELECTOR */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {initialGames.map((game) => (
          <button
            key={game.id}
            onClick={() => setSelectedGame(game.id)}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-2 border-white transition-all shadow-neo-sm shrink-0 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none ${
              selectedGame === game.id
                ? "bg-accent text-black border-accent"
                : "bg-black text-white hover:bg-white hover:text-black"
            }`}
          >
            {game.name}
          </button>
        ))}
      </div>

      {/* PRODUCTS TABLE */}
      <div className="bg-black border-2 border-white p-5 shadow-neo overflow-x-auto rounded-none">
        <table className="w-full text-left min-w-[700px]">
          <thead>
            <tr className="border-b-2 border-white/20 text-[10px] font-black text-white/60 uppercase tracking-widest">
              <th className="pb-3 px-2">Nama Produk</th>
              <th className="pb-3 px-2 w-32">Harga Jual (Rp)</th>
              <th className="pb-3 px-2 w-32">Harga Coret (Rp)</th>
              <th className="pb-3 px-2 w-24">Label Diskon</th>
              <th className="pb-3 px-2 w-24 text-center">Flash Sale?</th>
              <th className="pb-3 px-2 text-right w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-xs font-bold text-white">
            {filteredProducts.map((p) => {
              const isEditing = editingId === p.id;

              return (
                <tr key={p.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-3">
                      {p.icon && (
                        <span className="w-6 h-6 shrink-0 flex items-center justify-center">
                          {p.icon.startsWith("http") ? (
                            <img src={p.icon} alt="" className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-lg">{p.icon}</span>
                          )}
                        </span>
                      )}
                      <span className="font-bold">{p.name}</span>
                    </div>
                  </td>
                  
                  <td className="py-4 px-2">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.price}
                        onChange={(e) => {
                          const newPrice = Number(e.target.value);
                          setEditForm({ ...editForm, price: newPrice });
                        }}
                        className="w-full bg-black border-2 border-white p-1.5 text-white outline-none focus:border-accent"
                      />
                    ) : (
                      <span className="font-mono">Rp {p.price.toLocaleString("id-ID")}</span>
                    )}
                  </td>

                  <td className="py-4 px-2">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.original_price}
                        onChange={(e) => setEditForm({ ...editForm, original_price: Number(e.target.value) })}
                        className="w-full bg-black border-2 border-white p-1.5 text-white outline-none focus:border-accent"
                      />
                    ) : (
                      <span className="font-mono text-white/50 line-through">
                        {p.original_price > p.price ? `Rp ${p.original_price.toLocaleString("id-ID")}` : "-"}
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.discount}
                        onChange={(e) => {
                          let val = e.target.value;
                          let newPrice = editForm.price;
                          let newOriginalPrice = editForm.original_price;
                          
                          const match = val.match(/(\d+(\.\d+)?)/);
                          if (match) {
                            const discountPercent = parseFloat(match[1]);
                            if (discountPercent > 0 && discountPercent < 100) {
                              // Use the current price as the original baseline if original_price hasn't been set yet
                              const basePrice = newOriginalPrice > 0 ? newOriginalPrice : editForm.price;
                              newOriginalPrice = basePrice;
                              newPrice = Math.round(basePrice * (1 - (discountPercent / 100)));
                            }
                          }

                          setEditForm({ ...editForm, discount: val, price: newPrice, original_price: newOriginalPrice });
                        }}
                        placeholder="Contoh: 10% OFF"
                        className="w-full bg-black border-2 border-white p-1.5 text-white outline-none focus:border-accent text-[10px]"
                      />
                    ) : (
                      p.discount ? (
                        <span className="bg-accent-red text-white px-2 py-0.5 text-[9px] border border-accent-red">
                          {p.discount}
                        </span>
                      ) : (
                        "-"
                      )
                    )}
                  </td>

                  <td className="py-4 px-2 text-center">
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={editForm.is_flash_sale}
                        onChange={(e) => setEditForm({ ...editForm, is_flash_sale: e.target.checked })}
                        className="w-4 h-4 accent-accent"
                      />
                    ) : (
                      <span className={`font-black uppercase text-[10px] ${p.is_flash_sale ? "text-accent" : "text-white/30"}`}>
                        {p.is_flash_sale ? "YA" : "TIDAK"}
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-2 text-right">
                    {isEditing ? (
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleSave(p.id)}
                          disabled={isSaving}
                          className="bg-accent text-black p-1.5 border-2 border-accent shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-50"
                          title="Simpan"
                        >
                          <FiCheck />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          disabled={isSaving}
                          className="bg-white text-black p-1.5 border-2 border-white shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-50"
                          title="Batal"
                        >
                          <FiX />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(p)}
                        className="bg-black text-white p-1.5 border-2 border-white shadow-neo-sm hover:bg-white hover:text-black hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                        title="Edit Harga"
                      >
                        <FiEdit2 />
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
