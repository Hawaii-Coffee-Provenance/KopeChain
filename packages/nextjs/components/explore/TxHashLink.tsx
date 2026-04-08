import Link from "next/link";
import { zeroAddress } from "viem";
import { truncateAddress } from "~~/utils/coffee";

type TxHashLinkProps = {
  txHash: `0x${string}` | undefined;
  disableTruncation?: boolean;
  href: string;
  ariaLabel?: string;
};

const TxHashLink = ({ txHash, disableTruncation, href, ariaLabel }: TxHashLinkProps) => {
  const fallbackText = zeroAddress;

  const label = txHash ?? fallbackText;

  return (
    <Link
      href={href}
      target="_blank"
      className="flex items-center gap-1.5 text-primary w-full min-w-0"
      aria-label={ariaLabel}
    >
      <span className="font-sans text-md border-b border-transparent hover:border-primary pb-0.5 transition-colors truncate">
        {disableTruncation && txHash ? (
          <>
            <span className="sm:hidden">{truncateAddress(txHash)}</span>
            <span className="hidden sm:inline">{txHash}</span>
          </>
        ) : (
          truncateAddress(label)
        )}
      </span>
    </Link>
  );
};

export default TxHashLink;
