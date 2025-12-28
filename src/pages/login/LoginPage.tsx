import { useAuth } from "@/app/providers/AuthProvider";
import { GoogleLoginButton } from "@/features/auth/google-login/GoogleLoginButton";
import { Navigate, useLocation } from "react-router-dom";
import moneyAnimatedBg from "../../assets/money-bg-video.mp4";
import moneyTree from "../../assets/dollars-login.png";

export function LoginPage() {
  const { user, loading } = useAuth();
  const loc = useLocation();

  if (!loading && user) {
    const next = (loc.state as any)?.next as string | undefined;
    const target = next ?? (user.isOnboarded ? "/dashboard" : "/onboarding");
    return <Navigate to={target} replace />;
  }

  return (
    <div className="relativ flex justify-end overflow-hidden h-screen">
      <video
        autoPlay
        muted
        loop
        className="fixed top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src={moneyAnimatedBg} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div
        className="
        text-white 
        relative 
        z-10 
        w-full 
        h-full
        p-10
        bg-white/25 
        backdrop-blur-[50px] -90 
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
        <div className="flex items-center pt-30 gap-5">
          <div className="">
            <h1 className="text-8xl sm:text-7xl font-semibold md:text-7xl lg:text-8xl">
              FinFix
            </h1>
            <p className="text-end text-base text-white/90 md:text-xl">
              Personal finance assistant
            </p>
          </div>
          <img src={moneyTree} alt="logo" className="w-40 lg:w-40" />
        </div>
        <div className="w-full flex justify-center items-start mt-5">
          <GoogleLoginButton />
        </div>
      </div>
    </div>
  );
}
