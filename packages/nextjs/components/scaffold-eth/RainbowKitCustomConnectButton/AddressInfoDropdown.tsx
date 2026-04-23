import { useRef, useState } from "react";
import Link from "next/link";
import { NetworkOptions } from "./NetworkOptions";
import { getAddress } from "viem";
import { Address } from "viem";
import { useDisconnect } from "wagmi";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { useOutsideClick } from "~~/hooks/scaffold-eth";
import { truncateAddress } from "~~/utils/coffee";
import { copyWithFeedback } from "~~/utils/forms";
import { isENS } from "~~/utils/scaffold-eth/common";

type AddressInfoDropdownProps = {
  address: Address;
  blockExplorerAddressLink: string | undefined;
  displayName: string;
  ensAvatar?: string;
};

export const AddressInfoDropdown = ({ address, ensAvatar, displayName }: AddressInfoDropdownProps) => {
  const { disconnect } = useDisconnect();
  const checkSumAddress = getAddress(address);
  const [selectingNetwork, setSelectingNetwork] = useState(false);
  const [showCopiedText, setShowCopiedText] = useState(false);
  const dropdownRef = useRef<HTMLDetailsElement>(null);

  const closeDropdown = () => {
    setSelectingNetwork(false);
    dropdownRef.current?.removeAttribute("open");
  };

  useOutsideClick(dropdownRef, closeDropdown);

  const handleCopy = (value: string) => {
    copyWithFeedback({
      value,
      showValue: true,
      clearValue: false,
      setShowCopiedText,
    });
  };

  return (
    <>
      <details ref={dropdownRef} className="dropdown dropdown-end leading-3 group">
        <summary className="btn bg-primary text-primary-content border-none btn-sm p-2 shadow-md dropdown-toggle gap-2 !h-auto font-sans text-xs font-medium tracking-[0.1em] uppercase">
          <div className="bg-white/20 p-[2px] rounded-full">
            <BlockieAvatar address={checkSumAddress} size={20} ensImage={ensAvatar} />
          </div>
          <span className="ml-1 mr-1 hidden md:flex">
            {isENS(displayName) ? displayName : truncateAddress(checkSumAddress)}
          </span>
          <ChevronDownIcon className="h-4 w-4 ml-1 sm:ml-0 transition-transform duration-200 group-open:rotate-180 hidden md:flex" />
        </summary>

        <ul className="dropdown-content menu p-2 mt-2 bg-base-100 border border-base-300 rounded-xl shadow-lg w-52 list-none gap-1 z-50">
          <NetworkOptions hidden={!selectingNetwork} />

          <li className={selectingNetwork ? "hidden" : ""}>
            <Link
              href="/profile"
              className="h-8 btn-sm !rounded-xl flex gap-3 py-3 text-base-content bg-transparent hover:bg-base-200 active:!bg-base-200 active:!text-base-content"
              onClick={closeDropdown}
            >
              <span className="whitespace-nowrap">Profile</span>
            </Link>
          </li>

          <li className={selectingNetwork ? "hidden" : ""}>
            <button
              type="button"
              className="h-8 btn-sm !rounded-xl flex gap-3 py-3 text-base-content bg-transparent hover:bg-base-200 active:!bg-base-200 active:!text-base-content"
              onClick={() => handleCopy(checkSumAddress)}
            >
              <span className="whitespace-nowrap transition-opacity duration-200">
                {showCopiedText ? "Copied!" : "Copy Address"}
              </span>
            </button>
          </li>

          <li className={selectingNetwork ? "hidden" : ""}>
            <button
              className="h-8 btn-sm !rounded-xl flex gap-3 py-3 text-error bg-transparent hover:bg-base-200 active:!bg-base-200 active:!text-base-content"
              type="button"
              onClick={() => disconnect()}
            >
              <span>Disconnect</span>
            </button>
          </li>
        </ul>
      </details>
    </>
  );
};
