"use client";

import { useState } from "react";
import { FiEdit2, FiSave, FiX, FiCheck } from "react-icons/fi";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ProductsClient({ initialGames, initialProducts }: { initialGames: any[], initialProducts: any[] }) {
  const [selectedGame, setSelectedGame] = useState(initialGames[0]?.id || "");
  const [products, setProducts] = useState(initialProducts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ 
    price: 0, 
    original_price: 0, 
    discount: "", 
    is_flash_sale: false,
    buyer_sku_code: "",
    provider_price: 0
  });

  // States for Add Product
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    buyer_sku_code: "",
    provider_price: 0,
    price: 0,
    original_price: 0,
    discount: "",
    icon: "",
    is_pass: false,
    is_flash_sale: false,
    sort_order: 0
  });

  // States for Bulk Margin
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkForm, setBulkForm] = useState({
    type: "fixed", // 'fixed' | 'percentage'
    value: 0
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const router = useRouter();

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setEditForm({
      price: product.price,
      original_price: product.original_price,
      discount: product.discount || "",
      is_flash_sale: product.is_flash_sale || false,
      buyer_sku_code: product.buyer_sku_code || "",
      provider_price: product.provider_price || 0
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
        buyer_sku_code: editForm.buyer_sku_code,
        provider_price: editForm.provider_price
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

  const handleAddProduct = async () => {
    if (!addForm.name) return alert("Nama produk wajib diisi!");
    if (addForm.price < addForm.provider_price) return alert("Harga jual tidak boleh lebih kecil dari harga modal!");

    setIsSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .insert({
        game_id: selectedGame,
        ...addForm
      })
      .select()
      .single();

    setIsSaving(false);

    if (error) {
      alert("Gagal menambah produk: " + error.message);
      return;
    }

    setProducts(prev => [data, ...prev]);
    setShowAddModal(false);
    setAddForm({
      name: "", buyer_sku_code: "", provider_price: 0, price: 0, original_price: 0, discount: "", icon: "", is_pass: false, is_flash_sale: false, sort_order: 0
    });
    router.refresh();
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`YAKIN HAPUS PERMANEN PRODUK "${name}"?`)) return;
    
    setIsDeleting(id);
    const supabase = createClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    setIsDeleting(null);

    if (error) {
      alert("Gagal menghapus produk: " + error.message);
      return;
    }

    setProducts(prev => prev.filter(p => p.id !== id));
    router.refresh();
  };

  const toggleProductStatus = async (id: string, currentStatus: boolean) => {
    const supabase = createClient();
    const newStatus = !currentStatus;
    
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: newStatus } : p));
    const { error } = await supabase.from("products").update({ is_active: newStatus }).eq("id", id);

    if (error) {
      alert("Gagal mengubah status: " + error.message);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: currentStatus } : p));
    } else {
      router.refresh();
    }
  };

  const handleBulkMargin = async () => {
    if (bulkForm.value <= 0) return alert("Nilai margin harus lebih dari 0");
    if (!confirm("Update margin untuk SEMUA produk di game ini?")) return;

    setIsSaving(true);
    const supabase = createClient();

    const currentGameProducts = products.filter(p => p.game_id === selectedGame);
    
    for (const p of currentGameProducts) {
      const margin = bulkForm.type === "fixed" ? bulkForm.value : Math.round(p.provider_price * (bulkForm.value / 100));
      const newPrice = p.provider_price + margin;
      const newOriginalPrice = Math.round(newPrice / 0.9); // inflate by 10% for fake discount
      const discount = "10% OFF";

      await supabase.from("products").update({ price: newPrice, original_price: newOriginalPrice, discount }).eq("id", p.id);
    }

    setIsSaving(false);
    setShowBulkModal(false);
    alert("Berhasil update margin masal! (Harap refresh halaman untuk melihat perubahan jika ada yang terlewat cache)");
    
    // Hard reload to get new data
    window.location.reload();
  };

  const filteredProducts = products.filter(p => p.game_id === selectedGame);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* HEADER */}
      <div className="border-b-4 border-white pb-4 bg-accent p-6 text-black shadow-neo-lg flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wider">
            Kelola Harga & Diskon
          </h1>
          <p className="font-bold text-sm mt-1 opacity-80">
            Pembaruan harga di sini akan langsung mengubah harga di website utama pengunjung secara instan (real-time).
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBulkModal(true)}
            className="bg-black text-white px-4 py-2 border-2 border-black font-black uppercase text-xs shadow-neo-sm hover:bg-white hover:text-black transition-all"
          >
            Update Margin Masal
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-black text-white px-4 py-2 border-2 border-black font-black uppercase text-xs shadow-neo-sm hover:bg-white hover:text-black transition-all"
          >
            + Tambah Produk
          </button>
        </div>
      </div>

      {/* BULK MARGIN MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0a0a0a] border-4 border-accent p-6 w-full max-w-sm shadow-neo-lg text-white">
            <h2 className="text-xl font-black uppercase tracking-wider text-accent mb-4 border-b-2 border-white/20 pb-2">Update Margin Masal</h2>
            <p className="text-xs text-white/70 mb-4">Ubah harga jual SEMUA produk pada game ini berdasarkan persentase atau nominal flat dari harga modal (provider_price).</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">Tipe Margin</label>
                <select value={bulkForm.type} onChange={e => setBulkForm({...bulkForm, type: e.target.value})} className="w-full bg-black border-2 border-white p-2 outline-none">
                  <option value="fixed">Rupiah Flat (Misal: + Rp 2.000)</option>
                  <option value="percentage">Persentase (Misal: + 5%)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Nilai Margin</label>
                <input type="number" value={bulkForm.value} onChange={e => setBulkForm({...bulkForm, value: Number(e.target.value)})} className="w-full bg-black border-2 border-white p-2 outline-none" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setShowBulkModal(false)} className="px-4 py-2 text-xs font-bold border-2 border-white">Batal</button>
              <button onClick={handleBulkMargin} disabled={isSaving} className="px-4 py-2 text-xs font-black bg-accent text-black border-2 border-accent">
                {isSaving ? "Proses..." : "Terapkan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0a0a0a] border-4 border-accent p-6 w-full max-w-2xl shadow-neo-lg text-white max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h2 className="text-xl font-black uppercase tracking-wider text-accent mb-4 border-b-2 border-white/20 pb-2">Tambah Produk Baru</h2>
            
            <div className="grid grid-cols-2 gap-4 text-xs font-bold">
              <div className="col-span-2">
                <label className="block mb-1">Nama Produk</label>
                <input type="text" value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})} className="w-full bg-black border-2 border-white p-2" placeholder="100 Diamonds" />
              </div>
              <div>
                <label className="block mb-1">Kode SKU (VIP Reseller)</label>
                <input type="text" value={addForm.buyer_sku_code} onChange={e => setAddForm({...addForm, buyer_sku_code: e.target.value})} className="w-full bg-black border-2 border-white p-2" placeholder="Biarkan kosong jika manual" />
              </div>
              <div>
                <label className="block mb-1">URL Ikon (Logo Produk)</label>
                <input type="text" value={addForm.icon} onChange={e => setAddForm({...addForm, icon: e.target.value})} className="w-full bg-black border-2 border-white p-2" placeholder="https://..." />
              </div>
              <div>
                <label className="block mb-1 text-accent-red">Harga Modal (Rp)</label>
                <input type="number" value={addForm.provider_price} onChange={e => setAddForm({...addForm, provider_price: Number(e.target.value)})} className="w-full bg-black border-2 border-white p-2" />
              </div>
              <div>
                <label className="block mb-1 text-accent-green">Harga Jual (Rp)</label>
                <input type="number" value={addForm.price} onChange={e => setAddForm({...addForm, price: Number(e.target.value)})} className="w-full bg-black border-2 border-white p-2" />
              </div>
              <div>
                <label className="block mb-1">Harga Coret Asli (Rp)</label>
                <input type="number" value={addForm.original_price} onChange={e => setAddForm({...addForm, original_price: Number(e.target.value)})} className="w-full bg-black border-2 border-white p-2" />
              </div>
              <div>
                <label className="block mb-1">Label Diskon</label>
                <input type="text" value={addForm.discount} onChange={e => setAddForm({...addForm, discount: e.target.value})} className="w-full bg-black border-2 border-white p-2" placeholder="Contoh: 10% OFF" />
              </div>
              <div>
                <label className="block mb-1">Urutan Tampil (Sort Order)</label>
                <input type="number" value={addForm.sort_order} onChange={e => setAddForm({...addForm, sort_order: Number(e.target.value)})} className="w-full bg-black border-2 border-white p-2" />
              </div>
              <div className="flex flex-col gap-2 justify-center pt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={addForm.is_pass} onChange={e => setAddForm({...addForm, is_pass: e.target.checked})} className="w-4 h-4" />
                  Membership / Pass?
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={addForm.is_flash_sale} onChange={e => setAddForm({...addForm, is_flash_sale: e.target.checked})} className="w-4 h-4" />
                  Ikut Flash Sale?
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setShowAddModal(false)} className="px-6 py-2 font-bold border-2 border-white uppercase">Batal</button>
              <button onClick={handleAddProduct} disabled={isSaving} className="px-6 py-2 font-black bg-accent text-black border-2 border-accent uppercase">
                {isSaving ? "Simpan..." : "Simpan Produk"}
              </button>
            </div>
          </div>
        </div>
      )}

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
              <th className="pb-3 px-2 w-24">Kode SKU</th>
              <th className="pb-3 px-2 w-32">Harga Modal (Rp)</th>
              <th className="pb-3 px-2 w-32">Harga Jual (Rp)</th>
              <th className="pb-3 px-2 w-32">Harga Coret (Rp)</th>
              <th className="pb-3 px-2 w-24">Label Diskon</th>
              <th className="pb-3 px-2 w-16 text-center">Status</th>
              <th className="pb-3 px-2 text-center w-28">Aksi</th>
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
                        type="text"
                        value={editForm.buyer_sku_code}
                        onChange={(e) => setEditForm({ ...editForm, buyer_sku_code: e.target.value })}
                        placeholder="SKU"
                        className="w-full bg-black border-2 border-white p-1.5 text-white outline-none focus:border-accent text-[10px]"
                      />
                    ) : (
                      <span className="font-mono text-white/70">{p.buyer_sku_code || "-"}</span>
                    )}
                  </td>

                  <td className="py-4 px-2">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.provider_price}
                        onChange={(e) => setEditForm({ ...editForm, provider_price: Number(e.target.value) })}
                        className="w-full bg-black border-2 border-white p-1.5 text-white outline-none focus:border-accent"
                      />
                    ) : (
                      <span className="font-mono text-white/50">Rp {(p.provider_price || 0).toLocaleString("id-ID")}</span>
                    )}
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
                      <div className="flex flex-col">
                        <span className="font-mono">Rp {p.price.toLocaleString("id-ID")}</span>
                        {p.provider_price > 0 && p.price - p.provider_price > 0 && (
                          <span className="text-[9px] text-accent font-black tracking-widest mt-0.5">
                            +{((p.price - p.provider_price)).toLocaleString("id-ID")}
                          </span>
                        )}
                      </div>
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
                              // Fake discount: keep the selling price the same, inflate the original price
                              newOriginalPrice = Math.round(newPrice / (1 - (discountPercent / 100)));
                            }
                          } else if (val.trim() === "") {
                              // If they clear the discount, remove original price
                              newOriginalPrice = newPrice;
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
                    <button
                      onClick={() => toggleProductStatus(p.id, p.is_active)}
                      disabled={isEditing}
                      className={`px-2 py-1 text-[9px] font-black uppercase border border-white ${p.is_active ? "bg-accent-green text-black" : "bg-accent-red text-white"}`}
                    >
                      {p.is_active ? "Aktif" : "Mati"}
                    </button>
                    <div className="mt-1">
                      {p.is_flash_sale && <span className="text-[8px] bg-accent text-black px-1 font-bold">⚡ FLASH</span>}
                    </div>
                  </td>

                  <td className="py-4 px-2 text-center">
                    {isEditing ? (
                      <div className="flex justify-center gap-1">
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
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => handleEdit(p)}
                          className="bg-black text-white p-1.5 border border-white hover:bg-white hover:text-black transition-all"
                          title="Edit Harga"
                        >
                          <FiEdit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          disabled={isDeleting === p.id}
                          className="bg-accent-red text-white p-1.5 border border-white hover:bg-white hover:text-black transition-all disabled:opacity-50"
                          title="Hapus Produk"
                        >
                          <FiX className="w-3 h-3" />
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
