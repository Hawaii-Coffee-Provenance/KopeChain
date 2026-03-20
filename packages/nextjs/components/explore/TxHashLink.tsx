import Link from "next/link";

type TxHashLinkProps = {
  txHash: `0x${string}` | undefined;
  disableTruncation?: boolean;
};

const TxHashLink = ({ txHash, disableTruncation }: TxHashLinkProps) => {
  if (!txHash) return <span className="text-xs text-base-content/30 font-sans">—</span>;

  const short = `${txHash.substring(0, 6)}...${txHash.substring(txHash.length - 4)}`;

  return (
    <Link
      href={`/explore/transaction/${txHash}`}
      target="_blank"
      className="flex items-center gap-1.5 text-primary shrink-0"
    >
      <span className="font-sans text-md border-b border-transparent hover:border-primary pb-0.5 transition-colors">
        {disableTruncation ? (
          <>
            <span className="sm:hidden">{short}</span>
            <span className="hidden sm:inline">{txHash}</span>
          </>
        ) : (
          short
        )}
      </span>
    </Link>
  );
};

export default TxHashLink;
