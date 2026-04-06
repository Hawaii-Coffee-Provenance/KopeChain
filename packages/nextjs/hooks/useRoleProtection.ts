import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useUserRole } from "~~/hooks/useCoffeeTracker";

export const useRoleProtection = (allowedRoles: string[]) => {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { userRole, isLoading } = useUserRole(address);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isReady = mounted && !isConnecting && !isReconnecting;
  const normalizedUserRole = typeof userRole === "string" ? userRole.trim() : "";
  const isRoleResolved = isReady && !isLoading && (!isConnected || normalizedUserRole.length > 0);
  const isAuthorized = isRoleResolved && allowedRoles.includes(normalizedUserRole);
  const isUnauthorized = isRoleResolved && !isAuthorized;

  return {
    userRole: normalizedUserRole || undefined,
    isLoading,
    isReady,
    isAuthorized,
    isUnauthorized,
  };
};
