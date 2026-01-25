import { useAuth } from "@/app/providers/AuthProvider";
import { GoogleLoginButton } from "@/features/auth/google-login/GoogleLoginButton";
import { Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import finfixBg from "../../assets/bg.jpg";

export function LoginPage() {
  const { user, loading } = useAuth();
  const loc = useLocation();

  // Clear logout flag when user successfully interacts with login page
  // This allows normal login flow after logout
  useEffect(() => {
    // Only clear flag after a short delay to ensure AuthProvider has finished initializing
    const timer = setTimeout(() => {
      sessionStorage.removeItem("finfix_logging_out");
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!loading && user) {
    const next = (loc.state as { next?: string } | null)?.next;
    const target = next ?? (user.isOnboarded ? "/profile" : "/onboarding");
    return <Navigate to={target} replace />;
  }

  return (
    <div className="relative flex justify-end overflow-hidden h-screen">
      <img
        src={finfixBg}
        alt="Background"
        className="fixed top-0 left-0 w-full h-full object-cover z-0"
      />

      <div
        className="
        text-white 
        relative 
        z-10 
        w-full 
        h-full
        p-10
        bg-white/10 
        backdrop-blur-xl
        border-l border-white/30
        shadow-2xl
        flex
        flex-col
        justify-start
        items-center
        sm:w-[70%]
        sm:justify-start
        sm:h-screen
        sm:rounded-none
        md:w-[50%]
        lg:w-[40%]
        "
      >
        <div className="flex items-center pt-30 gap-2">
          <div className="">
            <h1 className="text-primary-blue text-[5rem] sm:text-[5rem] font-light tracking-wide md:text-[5rem] lg:text-[5rem] leading-none">
              FinFix
            </h1>
            <p className="text-[2rem] sm:text-[1rem] md:text-[1rem] font-extralight lg:text-[1rem] xl:text-[2rem] text-primary-blue/90">
              Personal finance assistant
            </p>
          </div>
        </div>
        <div className="w-full flex justify-center items-start mt-4">
          <GoogleLoginButton />
        </div>
      </div>
    </div>
  );
}
