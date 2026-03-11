"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick } from "~~/hooks/scaffold-eth";

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
    label: "Add",
    href: "/add",
  },
  {
    label: "Debug",
    href: "/debug",
  },
  {
    label: "Admin",
    href: "/admin",
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`
                text-xs font-medium tracking-[0.1em] uppercase px-2 py-1.5 transition-colors 
                  ${isActive ? "text-base-content" : "text-secondary hover:text-base-content"}
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

export const Header = () => {
  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-8 h-16 bg-base-100 border-b border-base-300 shadow-none">
      <div className="flex items-center gap-8">
        <Link href="/" className="font-serif text-2xl font-semibold text-base-content tracking-tight">
          Kope<span className="italic text-accent">Chain</span>
        </Link>

        <ul className="hidden lg:flex items-center gap-1 list-none">
          <HeaderMenuLinks />
        </ul>
      </div>

      <div className="flex items-center gap-2">
        <SwitchTheme />
        <RainbowKitCustomConnectButton />

        <details className="dropdown dropdown-end lg:hidden" ref={burgerMenuRef}>
          <summary className="btn btn-ghost btn-sm">
            <Bars3Icon className="h-5 w-5" />
          </summary>
          <ul
            className="dropdown-content menu p-2 mt-2 bg-base-100 border border-base-300 rounded-xl shadow-lg w-44 list-none"
            onClick={() => burgerMenuRef?.current?.removeAttribute("open")}
          >
            <HeaderMenuLinks />
          </ul>
        </details>
      </div>
    </header>
  );
};
