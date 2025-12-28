import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";

function Loader() {
  return (
    <div className="grid h-screen place-items-center">
      <div className="animate-pulse text-sm text-neutral-500">Loading…</div>
    </div>
  );
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <Loader />;
  if (!user)
    return <Navigate to="/login" replace state={{ next: loc.pathname }} />;
  return <>{children}</>;
}

export function RequireOnboarded({
  children,
  invert = false,
}: {
  children: React.ReactNode;
  invert?: boolean;
}) {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return null;
  const ok = invert ? !user.isOnboarded : user.isOnboarded;
  if (!ok)
    return <Navigate to={invert ? "/dashboard" : "/onboarding"} replace />;
  return <>{children}</>;
}

export function RequireGuest({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <Loader />;
  if (user) {
    const next = loc.state?.next as string | undefined;
    const target = next ?? (user.isOnboarded ? "/dashboard" : "/onboarding");
    return <Navigate to={target} replace />;
  }
  return <>{children}</>;
}
