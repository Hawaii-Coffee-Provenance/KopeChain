import Link from "next/link";

type TxHashLinkProps = {
  txHash: `0x${string}` | undefined;
};

export const TxHashLink = ({ txHash }: TxHashLinkProps) => {
  if (!txHash) return <span className="text-xs text-base-content/30 font-sans">—</span>;

  return (
    <Link
      href={`/explore/transaction/${txHash}`}
      target="_blank"
      className="font-sans text-xs text-primary border-b border-transparent hover:border-primary pb-0.5 transition-colors"
    >
      {txHash.substring(0, 6)}...{txHash.substring(62)}
    </Link>
  );
};
