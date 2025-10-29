"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getRole, getToken } from "@/lib/auth";

type Role = "student" | "admin" | "counselor";

type Props = {
  roles?: Array<Role>;
  children: React.ReactNode;
};

export default function RequireAuth({ roles, children }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token = getToken();
    const role = getRole();
    if (!token || !role) {
      const roleHint = roles && roles.length === 1 ? `?role=${roles[0]}` : "";
      router.replace(`/login${roleHint}`);
      return;
    }
    if (roles && roles.length > 0 && role && !roles.includes(role as Role)) {
      const roleHint = `?role=${role}`;
      router.replace(`/login${roleHint}`);
      return;
    }
    setAllowed(true);
  }, [router, roles, params]);

  if (!allowed) return null;
  return <>{children}</>;
}
