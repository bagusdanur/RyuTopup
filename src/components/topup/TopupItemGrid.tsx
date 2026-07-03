type ItemGridProps = {
  passes: any[];
  regularItems: any[];
  activeItem: string | null;
  setActiveItem: (id: string) => void;
  setCheckoutError: (err: string | null) => void;
  shortenName: (name: string) => string;
};

export default function TopupItemGrid({
  passes,
  regularItems,
  activeItem,
  setActiveItem,
  setCheckoutError,
  shortenName,
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
              const isSelected = activeItem === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveItem(item.id);
                    setCheckoutError(null);
                  }}
                  className={`relative border-2 p-3.5 flex flex-col items-center gap-2 min-h-[130px] cursor-pointer transition-all text-center overflow-hidden select-none rounded-none shadow-neo-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
                    isSelected
                      ? "bg-accent border-accent shadow-none"
                      : "bg-black border-white/60 hover:border-white"
                  }`}
                >
                  {/* Discount badge top-left */}
                  {item.discount && (
                    <span className={`absolute top-0 left-0 text-[8px] font-black px-2 py-0.5 uppercase tracking-wider ${
                      isSelected ? "bg-black text-accent" : "bg-accent-red text-white"
                    }`}>
                      {item.discount}
                    </span>
                  )}

                  {/* Icon focal point */}
                  <span className="text-3xl leading-none mt-1">
                    {typeof item.icon === "string" && item.icon.startsWith("http") ? (
                      <img src={item.icon} alt="" className="w-8 h-8 object-contain mx-auto" />
                    ) : (
                      item.icon
                    )}
                  </span>

                  {/* Name */}
                  <span className={`text-[12px] leading-tight font-black uppercase tracking-wide line-clamp-2 text-center w-full ${
                    isSelected ? "text-black" : "text-white"
                  }`}>
                    {shortenName(item.name)}
                  </span>

                  {/* Divider */}
                  <span className={`w-full border-t ${ isSelected ? "border-black/30" : "border-white/20" }`} />

                  {/* Price zone */}
                  <div className="flex flex-col items-center gap-0.5">
                    {item.original_price && item.original_price > item.price && (
                      <span className={`text-[9px] font-bold line-through ${ isSelected ? "text-black/50" : "text-white/35" }`}>
                        Rp {item.original_price.toLocaleString("id-ID")}
                      </span>
                    )}
                    <span className={`text-[11px] font-black leading-none font-mono ${
                      isSelected ? "text-black" : "text-white/80"
                    }`}>
                      Rp {item.price.toLocaleString("id-ID")}
                    </span>
                  </div>

                  {/* Selected checkmark */}
                  {isSelected && (
                    <span className="absolute top-1.5 right-2 text-[10px] font-black text-black">✓</span>
                  )}
                </button>
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
              const isSelected = activeItem === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveItem(item.id);
                    setCheckoutError(null);
                  }}
                  className={`relative border-2 p-3.5 flex flex-col items-center gap-2 min-h-[130px] cursor-pointer transition-all text-center overflow-hidden select-none rounded-none shadow-neo-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
                    isSelected
                      ? "bg-accent border-accent shadow-none"
                      : "bg-black border-white/60 hover:border-white"
                  }`}
                >
                  {/* Discount badge top-left */}
                  {item.discount && (
                    <span className={`absolute top-0 left-0 text-[8px] font-black px-2 py-0.5 uppercase ${
                      isSelected ? "bg-black text-accent" : "bg-accent-red text-white"
                    }`}>
                      {item.discount}
                    </span>
                  )}

                  {/* Icon focal point — big */}
                  <span className="text-3xl leading-none mt-1">
                    {typeof item.icon === "string" && item.icon.startsWith("http") ? (
                      <img src={item.icon} alt="" className="w-8 h-8 object-contain mx-auto" />
                    ) : (
                      item.icon
                    )}
                  </span>

                  {/* Name */}
                  <span className={`text-[12px] leading-tight font-black uppercase tracking-wide line-clamp-2 text-center w-full ${
                    isSelected ? "text-black" : "text-white"
                  }`}>
                    {shortenName(item.name)}
                  </span>

                  {/* Divider */}
                  <span className={`w-full border-t ${ isSelected ? "border-black/30" : "border-white/20" }`} />

                  {/* Price zone with original_price strikethrough */}
                  <div className="flex flex-col items-center gap-0.5">
                    {item.original_price && item.original_price > item.price && (
                      <span className={`text-[9px] font-bold line-through ${ isSelected ? "text-black/50" : "text-white/35" }`}>
                        Rp {item.original_price.toLocaleString("id-ID")}
                      </span>
                    )}
                    <span className={`text-[11px] font-black leading-none font-mono ${
                      isSelected ? "text-black" : "text-white/80"
                    }`}>
                      Rp {item.price.toLocaleString("id-ID")}
                    </span>
                  </div>

                  {/* Selected checkmark */}
                  {isSelected && (
                    <span className="absolute top-1.5 right-2 text-[10px] font-black text-black">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
