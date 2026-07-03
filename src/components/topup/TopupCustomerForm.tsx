import { FaSpinner } from "react-icons/fa";

type CustomerFormProps = {
  fields: any[];
  accountData: Record<string, string>;
  fieldErrors: Record<string, string>;
  nickname: string | null;
  isLoadingNickname: boolean;
  nicknameError: string | null;
  onInputChange: (id: string, val: string) => void;
  onCheckNickname: () => void;
};

export default function TopupCustomerForm({
  fields,
  accountData,
  fieldErrors,
  nickname,
  isLoadingNickname,
  nicknameError,
  onInputChange,
  onCheckNickname,
}: CustomerFormProps) {
  return (
    <div className="bg-black border-2 border-white p-5 space-y-4 rounded-none shadow-neo">
      <h3 className="text-sm md:text-base font-black text-white flex items-center gap-3 uppercase tracking-wider">
        <div className="w-6 h-6 border-2 border-white bg-white text-black flex items-center justify-center font-black shrink-0 text-[12px]">
          1
        </div>
        <span>Informasi Pelanggan</span>
      </h3>
      
      {/* Dynamic account fields */}
      <div className={`grid gap-3.5 ${fields.length >= 2 ? "grid-cols-2" : "grid-cols-1"}`}>
        {fields.map((field) => (
          <div key={field.id} className="flex flex-col gap-2" data-error={fieldErrors[field.id] ? "true" : undefined}>
            <label htmlFor={field.id} className="text-[11.5px] md:text-[12.5px] font-black text-white uppercase tracking-wider">{field.label}</label>
            {field.type === "select" ? (
              <select
                id={field.id}
                value={accountData[field.id] || ""}
                onChange={(e) => onInputChange(field.id, e.target.value)}
                className={`bg-black text-white border-2 border-white px-4 py-3 text-[13px] md:text-[13.5px] font-bold outline-none focus:shadow-neo transition-all cursor-pointer w-full rounded-none ${
                  fieldErrors[field.id] ? "border-rose-500 text-rose-500" : ""
                }`}
              >
                <option value="" disabled className="text-white/50">{field.placeholder}</option>
                {field.options?.map((opt: string) => (
                  <option key={opt} value={opt} className="bg-black text-white">
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={field.id}
                type="text"
                placeholder={field.placeholder}
                value={accountData[field.id] || ""}
                onChange={(e) => onInputChange(field.id, e.target.value)}
                className={`bg-black text-white border-2 border-white px-4 py-3 text-[13px] md:text-[13.5px] font-bold outline-none placeholder-white/40 focus:shadow-neo transition-all w-full rounded-none ${
                  fieldErrors[field.id] ? "border-rose-500 placeholder-rose-500/50" : ""
                }`}
              />
            )}
            {fieldErrors[field.id] && (
              <span className="text-[10px] text-rose-400 font-extrabold uppercase tracking-wide">{fieldErrors[field.id]}</span>
            )}
          </div>
        ))}
      </div>

      {/* Nickname Check */}
      <div className="pt-1">
        <button
          onClick={onCheckNickname}
          disabled={isLoadingNickname}
          className="bg-accent border-2 border-accent text-black px-4 py-2 text-xs font-black uppercase tracking-wider shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all disabled:opacity-50 cursor-pointer"
        >
          {isLoadingNickname ? "Mengecek..." : "Cek Nickname"}
        </button>
        
        {nicknameError && (
          <div className="mt-2 text-[11px] text-rose-500 font-bold uppercase">{nicknameError}</div>
        )}
        {nickname && (
          <div className="mt-2 bg-green-500/10 border-2 border-green-500 p-2.5 flex flex-col animate-fadeIn">
            <span className="text-[10px] text-green-500 font-black uppercase tracking-wider mb-0.5">Nickname Ditemukan:</span>
            <span className="text-sm text-green-400 font-bold">{nickname}</span>
          </div>
        )}
      </div>
    </div>
  );
}
