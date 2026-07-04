type ItemGridProps = {
  passes: any[];
  regularItems: any[];
  activeItem: string | null;
  setActiveItem: (id: string) => void;
  setCheckoutError: (err: string | null) => void;
  shortenName: (name: string) => string;
  providerBalance: number;
  dynamicStockEnabled: boolean;
};

export default function TopupItemGrid({
  passes,
  regularItems,
  activeItem,
  setActiveItem,
  setCheckoutError,
  shortenName,
  providerBalance,
  dynamicStockEnabled,
}: ItemGridProps) {
  return (
    <div className="bg-black border-2 border-white p-5 space-y-4 rounded-none shadow-neo">
      <h3 className="text-sm md:text-base font-black text-white flex items-center gap-3 uppercase tracking-wider">
        <div className="w-6 h-6 border-2 border-white bg-white text-black flex items-center justify-center font-black shrink-0 text-[12px]">
          2
        </div>
        <span>Pilih Nominal Top Up</span>
      </h3>

      {passes.length > 0 && (
        <div className="space-y-3 mb-6">
          <div className="text-[10px] font-black uppercase text-white/50 tracking-widest">
            ✦ Membership / Pass
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {passes.map((item: any) => {
              const outOfStock = dynamicStockEnabled && (item.provider_price ?? 0) > providerBalance;
              return (
                <ProductCard
                  key={item.id}
                  item={item}
                  isSelected={activeItem === item.id}
                  outOfStock={outOfStock}
                  onClick={() => {
                    if (outOfStock) return;
                    setActiveItem(item.id);
                    setCheckoutError(null);
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      {regularItems.length > 0 && (
        <div className="space-y-3">
          {passes.length > 0 && (
            <div className="text-[10px] font-black uppercase text-white/50 tracking-widest">
              ✦ Nominal Top Up
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {regularItems.map((item: any) => {
              const outOfStock = dynamicStockEnabled && (item.provider_price ?? 0) > providerBalance;
              return (
                <ProductCard
                  key={item.id}
                  item={item}
                  isSelected={activeItem === item.id}
                  outOfStock={outOfStock}
                  onClick={() => {
                    if (outOfStock) return;
                    setActiveItem(item.id);
                    setCheckoutError(null);
                  }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ProductCard({ item, isSelected, outOfStock, onClick }: { item: any; isSelected: boolean; outOfStock: boolean; onClick: () => void }) {
  // Parsing discount label (e.g. "10%" -> "Disc 10%")
  let discText = "";
  if (item.discount) {
    const d = item.discount.replace(/[^0-9.]/g, "");
    if (d) discText = `Disc ${d}%`;
    else discText = item.discount;
  }

  return (
    <button
      onClick={onClick}
      disabled={outOfStock}
      title={outOfStock ? "Item ini sedang tidak tersedia" : undefined}
      className={`relative border-2 p-3 flex flex-col transition-all text-left overflow-hidden select-none rounded-none shadow-neo-sm min-h-[120px] ${
        outOfStock
          ? "bg-black/60 border-white/15 opacity-50 cursor-not-allowed"
          : isSelected
            ? "bg-accent border-accent shadow-none cursor-pointer active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            : "bg-black border-white/60 hover:border-white cursor-pointer active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
      }`}
    >
      {/* Stok Habis overlay badge */}
      {outOfStock && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <span className="bg-accent-red text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 border border-red-700 shadow-neo-sm rotate-[-8deg]">
            Stok Habis
          </span>
        </div>
      )}

      {/* Top: Name */}
      <div className={`font-black uppercase text-[12px] leading-tight mb-2 pr-2 line-clamp-2 ${
        outOfStock ? "text-white/30" : isSelected ? "text-black" : "text-white"
      }`}>
        {item.name}
      </div>

      {/* Middle: Icon & Prices */}
      <div className="flex items-center gap-2 mt-auto w-full">
        {/* Icon */}
        <div className="w-8 h-8 shrink-0 flex items-center justify-center">
          {typeof item.icon === "string" && item.icon.startsWith("http") ? (
            <img src={item.icon} alt="" className={`w-full h-full object-contain ${outOfStock ? "opacity-30" : ""}`} />
          ) : (
            <span className={`text-2xl leading-none ${outOfStock ? "opacity-30" : ""}`}>{item.icon}</span>
          )}
        </div>
        
        {/* Prices */}
        <div className="flex flex-col flex-1 justify-center items-start">
          {outOfStock ? (
            <span className="font-black text-[10px] text-white/30 uppercase">Tidak Tersedia</span>
          ) : (
            <>
              <span className={`font-black text-[12px] font-mono leading-none ${isSelected ? "text-black" : "text-white"}`}>
                Rp {item.price.toLocaleString("id-ID")}
              </span>
              {item.original_price && item.original_price > item.price && (
                <span className={`line-through text-[9px] font-bold leading-tight mt-0.5 ${isSelected ? "text-black/60" : "text-accent-red"}`}>
                  Rp {item.original_price.toLocaleString("id-ID")}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bottom tags */}
      {!outOfStock && (
        <div className="flex items-center gap-1.5 mt-3 w-full border-t pt-2 border-white/20">
          {discText && (
            <div className={`text-[9px] font-black uppercase px-1.5 py-0.5 ${
              isSelected ? "bg-black text-accent" : "bg-accent-red text-white"
            }`}>
              {discText}
            </div>
          )}
          
          {/* Instan Badge */}
          <div className="h-fit w-fit rounded bg-white px-1.5 py-0.5 ml-auto flex items-center gap-0.5">
            <svg width="10" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M8.57048 14.7439C8.6248 14.8408 8.70983 14.9168 8.81215 14.96C8.87414 14.9852 8.94024 14.9987 9.00714 15C9.08564 14.9969 9.1623 14.9754 9.23093 14.9372C9.29956 14.899 9.35821 14.8451 9.40214 14.78L15.9021 6.28011C15.9546 6.20906 15.9873 6.12536 15.997 6.03753C16.0067 5.94971 15.9929 5.86089 15.9571 5.78012C15.9158 5.69597 15.8518 5.6251 15.7722 5.57559C15.6926 5.52608 15.6008 5.49993 15.5071 5.50012H13.1321L13.9971 1.61017C14.0136 1.53638 14.0132 1.4598 13.9959 1.38618C13.9786 1.31257 13.9448 1.24384 13.8971 1.18518C13.85 1.12717 13.7906 1.08044 13.7231 1.04842C13.6556 1.01641 13.5818 0.999925 13.5071 1.00018H8.50715C8.39226 0.997107 8.27981 1.03371 8.18875 1.10383C8.09768 1.17396 8.03355 1.27331 8.00716 1.38517L7.63451 3H0V4.33333H7.32681L6.86527 6.33333H1.33334V7.66667H6.55758L6.50718 7.88509C6.48953 7.95962 6.48925 8.03721 6.50634 8.11186C6.52344 8.18652 6.55745 8.25625 6.60577 8.31568C6.65408 8.37511 6.7154 8.42264 6.785 8.45461C6.8546 8.48659 6.93061 8.50214 7.00717 8.50008H9.42214L9.24297 9.66667H6V11H9.03819L8.51215 14.425C8.49564 14.5348 8.51616 14.647 8.57048 14.7439Z" fill="#285346"/>
            </svg>
            <span className="text-[8px] font-black uppercase text-[#285346] tracking-tight leading-none">Instan</span>
          </div>
        </div>
      )}
    </button>
  );
}
