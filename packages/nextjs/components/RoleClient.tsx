"use client";

import { useRoleProtection } from "~~/hooks/useRoleProtection";

type RoleClientProps = {
  children: React.ReactNode;
  allowedRoles: string[];
  loadingComponent?: React.ReactNode;
};

const RoleClient = ({ children, allowedRoles, loadingComponent }: RoleClientProps) => {
  const { userRole, isLoading, isReady } = useRoleProtection(allowedRoles);

  if (!isReady || isLoading) {
    return (
      loadingComponent ?? (
        <div className="flex h-full w-full items-center justify-center min-h-[calc(100vh-4rem)]">
          <span className="loading loading-spinner loading-xl text-primary"></span>
        </div>
      )
    );
  }

  if (userRole && allowedRoles.includes(userRole)) {
    return <>{children}</>;
  }

  return null;
};

export default RoleClient;
