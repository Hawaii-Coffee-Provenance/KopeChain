"use client";

export const AdminInputField = ({ value, onChange, placeholder, type = "text", inputMode = "text" }: any) => (
  <input
    type={type}
    inputMode={inputMode}
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    className="flex-1 w-full min-w-0 bg-transparent px-3 h-10 text-base-content placeholder:text-base-content/50 outline-none text-sm border-l border-base-300 first:border-0"
  />
);

export const AdminRoleDropdown = ({ value, onChange, options = [] }: any) => (
  <div className="relative flex items-center flex-[0.5] min-w-0 border-l border-base-300 first:border-0">
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="select w-full bg-transparent px-4 h-10 text-base-content placeholder:text-base-content/50 outline-none text-sm cursor-pointer pr-8 border-none rounded-none focus:outline-none focus:ring-0 focus:border-transparent focus-within:outline-none focus:shadow-none"
    >
      {options.map((r: any) => (
        <option key={r.value?.toString()} value={r.value?.toString()}>
          {r.label}
        </option>
      ))}
    </select>
  </div>
);

export const AdminSubmitButton = ({ onClick, label, isWrite = false, disabled = false }: any) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`btn btn-ghost rounded-none border-0 border-l border-base-300 text-sm tracking-wide h-10 min-h-0 px-4 shrink-0 transition-colors hover:text-primary ${
      isWrite ? "font-bold" : ""
    }`}
  >
    {label}
  </button>
);

export const AdminNoArguments = () => {
  return (
    <div className="flex-1 bg-base-200/50 px-3 py-2 text-sm text-base-content/60 italic grid place-items-center justify-start border-r border-base-300">
      No arguments required
    </div>
  );
};
