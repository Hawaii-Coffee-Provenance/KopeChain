"use client";

import { ROLES } from "~~/utils/admin";

export const InputField = ({ value, onChange, placeholder, type = "text", inputMode = "text" }: any) => (
  <input
    type={type}
    inputMode={inputMode}
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    className="flex-1 w-full min-w-0 bg-transparent px-3 h-10 text-base-content placeholder:text-base-content/50 outline-none text-sm border-l border-base-300 first:border-0"
  />
);

export const RoleDropdown = ({ value, onChange }: any) => (
  <div className="relative flex items-center flex-[0.5] min-w-0 border-l border-base-300 first:border-0">
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="select w-full bg-transparent px-4 h-10 text-base-content placeholder:text-base-content/50 outline-none text-sm cursor-pointer pr-8 border-none rounded-none focus:outline-none focus:ring-0 focus:border-transparent focus-within:outline-none focus:shadow-none"
    >
      {ROLES.map(r => (
        <option key={r.value} value={r.value}>
          {r.label}
        </option>
      ))}
    </select>
  </div>
);

export const SubmitButton = ({ onClick, label, isWrite = false, disabled = false }: any) => (
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
