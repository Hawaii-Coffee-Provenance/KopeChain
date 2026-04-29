import { useEffect, useRef } from "react";
import { NetworkOptions } from "./NetworkOptions";
import { useDisconnect, useSwitchChain } from "wagmi";
import { ArrowLeftOnRectangleIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useOutsideClick } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

export const WrongNetworkDropdown = () => {
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { targetNetwork } = useTargetNetwork();
  const dropdownRef = useRef<HTMLDetailsElement>(null);

  useOutsideClick(dropdownRef, () => {
    dropdownRef.current?.removeAttribute("open");
  });

  useEffect(() => {
    if (switchChain && targetNetwork?.id) {
      switchChain(
        { chainId: targetNetwork.id },
        {
          onError: error => console.error("Auto-switch failed:", error),
        },
      );
    }
  }, [switchChain, targetNetwork?.id]);

  return (
    <details ref={dropdownRef} className="dropdown dropdown-end leading-3 group">
      <summary
        onClick={() => {
          if (switchChain && targetNetwork?.id) {
            switchChain({ chainId: targetNetwork.id }, { onError: error => console.error("Switch failed:", error) });
          }
        }}
        className="btn btn-error text-cream border-none btn-sm p-2 shadow-md dropdown-toggle gap-2 !h-auto font-sans text-xs font-medium tracking-[0.1em] uppercase"
      >
        <span>Wrong network</span>
        <ChevronDownIcon className="h-4 w-4 ml-1 sm:ml-0 transition-transform duration-200 group-open:rotate-180" />
      </summary>

      <ul className="dropdown-content menu p-2 mt-2 bg-base-100 border border-base-300 rounded-xl shadow-lg w-52 list-none gap-1 z-50">
        <NetworkOptions />
        <li>
          <button
            className="h-8 btn-sm !rounded-xl flex gap-3 py-3 text-error bg-transparent hover:bg-base-200 active:!bg-base-200 active:!text-base-content"
            type="button"
            onClick={() => disconnect()}
          >
            <ArrowLeftOnRectangleIcon className="h-4 w-4 ml-1 sm:ml-0" />
            <span>Disconnect</span>
          </button>
        </li>
      </ul>
    </details>
  );
};
