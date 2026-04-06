"use client";

import React, { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { Bars3Icon, QrCodeIcon } from "@heroicons/react/24/outline";
import QrModal from "~~/components/QrModal";
import SwitchTheme from "~~/components/SwitchTheme";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick } from "~~/hooks/scaffold-eth";
import { useUserRole } from "~~/hooks/useCoffeeTracker";

type HeaderMenuLink = {
  label: string;
  href: string;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Explore",
    href: "/explore",
  },
  {
    label: "Submit",
    href: "/submit",
  },
  {
    label: "Admin",
    href: "/admin",
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();
  const { address } = useAccount();
  const { userRole } = useUserRole(address);

  const allowedSubmitRoles = ["Admin", "Farmer", "Processor", "Roaster", "Distributor"];

  return (
    <>
      {menuLinks.map(({ label, href }) => {
        if (label === "Admin" && userRole !== "Admin") {
          return null;
        }

        if (label === "Submit" && (!userRole || !allowedSubmitRoles.includes(userRole))) {
          return null;
        }

        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`
                text-nav-link p-2 transition-colors 
                  ${isActive ? "text-base-content" : "text-muted hover:text-base-content"}
              `}
            >
              {label}
            </Link>
          </li>
        );
      })}
    </>
  );
};

const Header = () => {
  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  const [qrOpen, setQrOpen] = useState(false);

  const handleQrClose = useCallback(() => {
    setQrOpen(false);
  }, []);

  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-6 h-16 bg-base-100 border-b border-base-300 shadow-none">
      <div className="flex items-center gap-6">
        <Link href="/" className="font-serif text-2xl font-semibold text-base-content tracking-tight">
          Kope<span className="italic text-accent">Chain</span>
        </Link>

        <ul className="hidden lg:flex items-center gap-1 list-none">
          <HeaderMenuLinks />
        </ul>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center">
          <span className="text-nav-link p-2 text-muted hidden md:inline">Scan QR Code</span>
          <button
            onClick={() => setQrOpen(true)}
            className="flex items-center justify-center p-2 rounded-full hover:bg-base-content/5 transition-colors hover:cursor-pointer"
          >
            <QrCodeIcon className="h-6 w-6" />
          </button>
        </div>

        <SwitchTheme />

        <RainbowKitCustomConnectButton />

        <details className="dropdown dropdown-end lg:hidden" ref={burgerMenuRef}>
          <summary className="btn btn-ghost btn-sm btn-borderless hover:border-base-300">
            <Bars3Icon className="h-6 w-6" />
          </summary>
          <ul
            className="dropdown-content menu p-2 mt-2 bg-base-100 border border-base-300 rounded-xl shadow-lg w-44 list-none gap-1"
            onClick={() => burgerMenuRef?.current?.removeAttribute("open")}
          >
            <HeaderMenuLinks />
          </ul>
        </details>
      </div>

      <QrModal isOpen={qrOpen} onClose={handleQrClose} />
    </header>
  );
};

export default Header;
