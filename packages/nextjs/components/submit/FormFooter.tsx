"use client";

interface FormFooterProps {
  onReset: () => void;
  isUploading: boolean;
  isMining: boolean;
  submitLabel: string;
  disabled?: boolean;
  submitDisabled?: boolean;
}

const FormFooter = ({
  onReset,
  isUploading,
  isMining,
  submitLabel,
  disabled = false,
  submitDisabled = false,
}: FormFooterProps) => {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap border-t border-base-300 px-6 py-5 sm:px-8">
      <p className="text-hint text-xs leading-relaxed">
        Batch data and media are pinned to IPFS and linked to this batch on-chain for permanent transparency.
      </p>

      <div className="flex items-center gap-3 w-full sm:w-80">
        <button
          type="button"
          className="btn btn-ghost border flex-1 text-base tracking-wide whitespace-nowrap"
          onClick={onReset}
          disabled={disabled}
        >
          Reset
        </button>

        <button
          type="submit"
          className="btn btn-primary flex-1 text-base tracking-wide whitespace-nowrap"
          disabled={disabled || submitDisabled}
        >
          {isUploading ? "Uploading..." : isMining ? "Submitting..." : submitLabel}
        </button>
      </div>
    </div>
  );
};

export default FormFooter;
