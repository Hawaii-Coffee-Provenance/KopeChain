import Link from "next/link";
import { getAddress } from "viem";
import { BlockieAvatar } from "~~/components/scaffold-eth";

type BlockieAddressLinkProps = {
  address: string;
  disableTruncation?: boolean;
};

const BlockieAddressLink = ({ address, disableTruncation }: BlockieAddressLinkProps) => {
  const raw = getAddress(address);
  const short = `${raw.substring(0, 6)}...${raw.substring(raw.length - 4)}`;

  return (
    <Link href={`/explore/address/${raw}`} target="_blank" className="flex items-center gap-1.5 text-primary shrink-0">
      <BlockieAvatar address={raw} ensImage={null} size={20} />

      <span className="font-sans text-md border-b border-transparent hover:border-primary pb-0.5 transition-colors">
        {disableTruncation ? (
          <>
            <span className="sm:hidden">{short}</span>
            <span className="hidden sm:inline">{raw}</span>
          </>
        ) : (
          short
        )}
      </span>
    </Link>
  );
};

export default BlockieAddressLink;
