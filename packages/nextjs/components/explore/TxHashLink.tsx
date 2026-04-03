import Link from "next/link";
import { truncateAddress } from "~~/utils/coffee";

type TxHashLinkProps = {
  txHash: `0x${string}` | undefined;
  disableTruncation?: boolean;
  href: string;
};

const TxHashLink = ({ txHash, disableTruncation, href }: TxHashLinkProps) => {
  if (!txHash) return <span className="text-xs text-base-content/30 font-sans">—</span>;

  return (
    <Link href={href} target="_blank" className="flex items-center gap-1.5 text-primary w-full min-w-0">
      <span className="font-sans text-md border-b border-transparent hover:border-primary pb-0.5 transition-colors truncate">
        {disableTruncation ? (
          <>
            <span className="sm:hidden">{truncateAddress(txHash)}</span>
            <span className="hidden sm:inline">{txHash}</span>
          </>
        ) : (
          truncateAddress(txHash)
        )}
      </span>
    </Link>
  );
};

export default TxHashLink;
