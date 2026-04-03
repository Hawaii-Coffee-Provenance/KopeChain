import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { useAccount } from "wagmi";
import { useUserRole } from "~~/hooks/useCoffeeTracker";

export const useRoleProtection = (allowedRoles: string[]) => {
  const { address, isConnecting, isReconnecting } = useAccount();
  const { userRole, isLoading } = useUserRole(address);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isReady = mounted && !isConnecting && !isReconnecting;

  if (isReady && !isLoading && userRole && !allowedRoles.includes(userRole)) {
    notFound();
  }

  return { userRole, isLoading, isReady };
};
