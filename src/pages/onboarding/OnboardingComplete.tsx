import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingFrame } from "@/widgets/onboarding";
import { OnboardingStep } from "@/features/onboarding";
import { completeOnboarding } from "@/features/onboarding/api";
import { useAuth } from "@/app/providers/AuthProvider";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { Button } from "@/shared/ui";

export const OnboardingComplete = () => {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [isCompleting, setIsCompleting] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRedirect = useCallback(async () => {
    try {
      await refresh();
      navigate("/profile", { replace: true });
    } catch (err) {
      console.error("Failed to refresh user:", err);
      // Still try to navigate even if refresh fails
      navigate("/profile", { replace: true });
    }
  }, [navigate, refresh]);

  useEffect(() => {
    // Show content after a short delay
    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, 300);

    // Complete onboarding
    completeOnboarding()
      .then(() => {
        setIsCompleting(false);
      })
      .catch((error) => {
        console.error("Failed to complete onboarding:", error);
        setIsCompleting(false);
        setError("Failed to complete onboarding. You can still proceed to your profile.");
      });

    return () => {
      clearTimeout(contentTimer);
    };
  }, []);

  const widgetData = {
    title: "Onboarding Completed",
    body: "Your profile has been set up successfully!",
    step: OnboardingStep.INSTALLMENTS,
    showProgress: true,
    allStepsCompleted: true,
    hideNavigation: true,
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <OnboardingFrame {...widgetData}>
        <div className="flex-1 flex flex-col items-center min-h-0 overflow-y-auto nice-scroll py-1">
          {/* Animated Checkmark */}
          <div
            className={`mb-6 sm:mb-8 transition-all duration-1000 ${
              showContent
                ? "opacity-100 scale-100"
                : "opacity-0 scale-50"
            }`}
          >
            <div className="relative">
              <div className="relative bg-white/20 backdrop-blur-sm rounded-full p-3 sm:p-4 border-2 border-white/30">
                <CheckCircleIcon className="h-8 w-8 sm:h-10 sm:w-10 text-green-400" />
              </div>
            </div>
          </div>

          {/* Finish Button */}
          {!isCompleting && showContent && (
            <div className="mt-4 sm:mt-6 flex justify-center">
              <Button
                variant="glass-primary"
                size="lg"
                onClick={handleRedirect}
                className="px-8"
              >
                Go to FinFix
              </Button>
            </div>
          )}

          {/* Loading Indicator */}
          {isCompleting && (
            <div className="mt-2 sm:mt-3 flex items-center gap-2 text-primary-background/80">
              <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" />
              <span className="ml-2 text-xs sm:text-sm">Completing onboarding...</span>
            </div>
          )}

          {/* Error Message */}
          {error && !isCompleting && (
            <div className="mt-2 sm:mt-3 flex flex-col items-center gap-2">
              <p className="text-xs sm:text-sm text-primary-background/70 text-center">{error}</p>
            </div>
          )}
        </div>
      </OnboardingFrame>
    </div>
  );
};
