"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { Toaster } from "react-hot-toast";
import { type Config, WagmiProvider, useAccountEffect } from "wagmi";
import Footer from "~~/components/Footer";
import Header from "~~/components/Header";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { useRoleProtection } from "~~/hooks/useRoleProtection";
import { useThemeChange } from "~~/hooks/useThemeChange";

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { userRole, isReady, isLoading } = useRoleProtection([]);
  const [pendingRedirect, setPendingRedirect] = useState(false);

  useAccountEffect({
    onConnect() {
      setPendingRedirect(true);
    },
    onDisconnect() {
      setPendingRedirect(false);
    },
  });

  useEffect(() => {
    if (pendingRedirect && isReady && !isLoading) {
      setPendingRedirect(false);

      if (userRole === "Admin") {
        router.push("/admin");
      } else if (userRole && ["Farmer", "Processor", "Roaster", "Distributor"].includes(userRole)) {
        router.push("/submit");
      } else {
        router.push("/explore");
      }
    }
  }, [pendingRedirect, isReady, isLoading, userRole, router]);

  return (
    <>
      <div className={`flex flex-col min-h-screen `}>
        <Header />
        <main className="relative flex flex-col flex-1">{children}</main>
        <Footer />
      </div>
      <Toaster />
    </>
  );
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const ScaffoldEthAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  const { isDarkMode, mounted } = useThemeChange();
  const [wagmiConfig, setWagmiConfig] = useState<Config | null>(null);

  useEffect(() => {
    // Defer wallet config loading to the browser to avoid SSR evaluating wallet storage internals.
    void import("~~/services/web3/wagmiConfig").then(module => {
      setWagmiConfig(module.wagmiConfig);
    });
  }, []);

  if (!wagmiConfig) {
    return (
      <>
        <div className="flex min-h-screen w-full items-center justify-center bg-base-200">
          <span className="loading loading-spinner loading-xl text-primary" />
        </div>
      </>
    );
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          avatar={BlockieAvatar}
          theme={mounted ? (isDarkMode ? darkTheme() : lightTheme()) : lightTheme()}
        >
          <ProgressBar height="3px" color="#2299dd" options={{ showSpinner: false }} />
          <ScaffoldEthApp>{children}</ScaffoldEthApp>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
