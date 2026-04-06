import { useEffect, useState } from "react";
import { useAccount, useReconnect } from "wagmi";
import { useUserRole } from "~~/hooks/useCoffeeTracker";

export const useRoleProtection = (allowedRoles: string[]) => {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { status: reconnectStatus } = useReconnect();
  const { userRole, isLoading } = useUserRole(address);
  const [mounted, setMounted] = useState(false);
  const [isSettled, setIsSettled] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isReconnectPending = reconnectStatus === "pending";
  const normalizedUserRole = typeof userRole === "string" ? userRole.trim() : "";
  const hasConnectedAddress = isConnected && !!address;

  useEffect(() => {
    if (!mounted) return;
    if (isConnecting || isReconnecting || isReconnectPending) {
      setIsSettled(false);
      return;
    }

    if (hasConnectedAddress && (isLoading || normalizedUserRole.length === 0)) return;

    const t = setTimeout(() => setIsSettled(true), 100);
    return () => clearTimeout(t);
  }, [mounted, isConnecting, isReconnecting, isReconnectPending, hasConnectedAddress, isLoading, normalizedUserRole]);

  const isRoleResolved = isSettled && !isLoading && (!isConnected || normalizedUserRole.length > 0);
  const isAuthorized = isRoleResolved && allowedRoles.includes(normalizedUserRole);
  const isUnauthorized = isRoleResolved && !isAuthorized;

  return {
    userRole: normalizedUserRole || undefined,
    isLoading,
    isReady: isSettled,
    isAuthorized,
    isUnauthorized,
  };
};
