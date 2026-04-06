"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRoleProtection } from "~~/hooks/useRoleProtection";

type RoleClientProps = {
  children: React.ReactNode | ((props: { userRole: string | undefined }) => React.ReactNode);
  allowedRoles: string[];
};

const RoleClient = ({ children, allowedRoles }: RoleClientProps) => {
  const router = useRouter();
  const { userRole, isLoading, isReady, isAuthorized, isUnauthorized } = useRoleProtection(allowedRoles);

  useEffect(() => {
    if (!isUnauthorized) return;
    router.replace("/forbidden");
  }, [isUnauthorized, router]);

  if (!isReady || isLoading) {
    return null;
  }

  if (isAuthorized) {
    if (typeof children === "function") {
      return <>{children({ userRole })}</>;
    }

    return <>{children}</>;
  }

  return null;
};

export default RoleClient;
