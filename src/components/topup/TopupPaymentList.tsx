import { FaChevronDown, FaChevronUp } from "react-icons/fa";

type PaymentListProps = {
  qrisMethods: any[];
  eWalletMethods: any[];
  convenienceMethods: any[];
  vaMethods: any[];
  expandedGroups: Record<string, boolean>;
  setExpandedGroups: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  activePayment: string | null;
  setActivePayment: (id: string) => void;
  selectedItem: any;
  setCheckoutError: (err: string | null) => void;
};

export default function TopupPaymentList({
  qrisMethods,
  eWalletMethods,
  convenienceMethods,
  vaMethods,
  expandedGroups,
  setExpandedGroups,
  activePayment,
  setActivePayment,
  selectedItem,
  setCheckoutError,
}: PaymentListProps) {
  return (
    <div className="bg-black border-2 border-white p-5 space-y-4 rounded-none shadow-neo">
      <h3 className="text-sm md:text-base font-black text-white flex items-center gap-3 uppercase tracking-wider">
        <div className="w-6 h-6 border-2 border-white bg-white text-black flex items-center justify-center font-black shrink-0 text-[12px]">
          3
        </div>
        <span>Pilih Pembayaran</span>
      </h3>

      <div className="space-y-3">
        {[
          { name: "QRIS", methods: qrisMethods },
          { name: "E-Wallet", methods: eWalletMethods },
          { name: "Convenience Store", methods: convenienceMethods },
          { name: "Virtual Account", methods: vaMethods },
        ].filter(group => group.methods.length > 0).map((group) => {
          const isOpen = expandedGroups[group.name];
          const activeInGroup = group.methods.some((m) => m.id === activePayment);
          
          return (
            <div key={group.name} className="border-2 border-white rounded-none overflow-hidden bg-black">
              {/* ACCORDION HEADER */}
              <div
                onClick={() => {
                  setExpandedGroups((prev) => ({
                    ...prev,
                    [group.name]: !prev[group.name],
                  }));
                }}
                className={`flex items-center justify-between p-3.5 cursor-pointer select-none transition-colors border-white ${
                  isOpen ? "bg-white text-black border-b-2" : "bg-black text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 border border-current ${activeInGroup ? "bg-accent-orange border-accent-orange" : "bg-transparent"}`}></span>
                  <span className="text-[11.5px] md:text-[13px] font-black uppercase tracking-wider">{group.name}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Logo previews (hide on open) */}
                  {!isOpen && (
                    <div className="flex items-center gap-1.5 opacity-80">
                      {group.methods.slice(0, 3).map((m) => (
                        <img key={m.id} src={m.logo} alt={m.name} className="h-3 md:h-3.5 w-auto object-contain max-w-[45px]" />
                      ))}
                      {group.methods.length > 3 && (
                        <span className="text-[8.5px] font-black text-black bg-white px-1.5 py-0.5 border border-white">+{group.methods.length - 3}</span>
                      )}
                    </div>
                  )}
                  
                  {isOpen ? (
                    <FaChevronUp className="text-[10px] md:text-[11.5px]" />
                  ) : (
                    <FaChevronDown className="text-[10px] md:text-[11.5px]" />
                  )}
                </div>
              </div>

              {/* ACCORDION CONTENT */}
              <div
                className={`transition-all duration-200 ease-in-out overflow-hidden ${
                  isOpen ? "max-h-[500px] p-4 opacity-100 bg-black border-t-0" : "max-h-0 opacity-0 pointer-events-none"
                }`}
              >
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-3">
                  {group.methods.map((method) => {
                    const isSelected = activePayment === method.id;
                    return (
                      <button
                        key={method.id}
                        onClick={() => {
                          setActivePayment(method.id);
                          setCheckoutError(null);
                          setExpandedGroups((prev) => ({ ...prev, [group.name]: true }));
                        }}
                        className={`border-2 rounded-none p-3 flex flex-col items-center justify-center gap-1.5 hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] shadow-[2px_2px_0px_white] transition-all text-center cursor-pointer relative min-h-[70px] ${
                          isSelected ? "bg-accent border-accent text-black font-black shadow-none" : "bg-black border-white text-white"
                        }`}
                      >
                        <img src={method.logo} alt={method.name} className={`h-5 w-auto object-contain max-w-[65px] mb-0.5 ${isSelected ? "" : "opacity-80"}`} />
                        <div className="flex flex-col items-center leading-none">
                          <span className={`text-[9.5px] md:text-[10px] font-black uppercase ${isSelected ? "text-black" : "text-white/80"}`}>{method.name}</span>
                          <span className={`text-[8.5px] md:text-[9.5px] font-bold mt-1 ${isSelected ? "text-black/80" : "text-white/40"}`}>
                            {selectedItem 
                              ? `Rp ${(selectedItem.price + method.fee).toLocaleString("id-ID")}`
                              : `+Rp ${method.fee.toLocaleString("id-ID")}`
                            }
                          </span>
                        </div>
                        {isSelected && (
                          <span className="absolute top-1 right-1.5 text-[8.5px] font-black bg-black text-accent-orange px-1 py-0 border border-black uppercase">OK</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
