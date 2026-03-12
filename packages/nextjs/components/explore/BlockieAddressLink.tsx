import Link from "next/link";
import { getAddress } from "viem";
import { BlockieAvatar } from "~~/components/scaffold-eth";

type BlockieAddressLinkProps = {
  address: string;
};

export const BlockieAddressLink = ({ address }: BlockieAddressLinkProps) => {
  const raw = getAddress(address);
  const short = `${raw.substring(0, 6)}...${raw.substring(raw.length - 4)}`;

  return (
    <Link href={`/explore/address/${raw}`} target="_blank" className="flex items-center gap-1.5 text-primary">
      <BlockieAvatar address={raw} ensImage={null} size={16} />
      <span className="font-sans text-xs border-b border-transparent hover:border-primary pb-0.5 transition-colors">
        {short}
      </span>
    </Link>
  );
};
