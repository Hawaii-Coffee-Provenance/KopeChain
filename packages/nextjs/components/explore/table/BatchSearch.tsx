"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  onSearch?: (query: string) => void;
  redirectToExplore?: boolean;
  placeholder?: string;
};

const BatchSearch = ({ onSearch, redirectToExplore = false, placeholder = "TX Hash, Batch ID, or Name..." }: Props) => {
  const [value, setValue] = useState("");
  const router = useRouter();

  const handleSubmit = () => {
    const q = value.trim();

    if (!q) return;

    if (redirectToExplore) {
      router.push(`/explore?q=${encodeURIComponent(q)}`);
    } else {
      onSearch?.(q);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="flex w-full bg-base-100 border border-base-300 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-primary transition-all">
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 bg-transparent px-3 py-2 text-base-content placeholder:text-base-content/50 outline-none text-sm"
      />
      <button
        type="button"
        onClick={handleSubmit}
        className="btn btn-ghost rounded-none border-0 border-l border-base-300 text-sm tracking-wide h-auto px-4"
      >
        Search
      </button>
    </div>
  );
};

export default BatchSearch;
