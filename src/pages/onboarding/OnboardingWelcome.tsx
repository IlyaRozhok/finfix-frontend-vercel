import { useAuth } from "@/app/providers/AuthProvider";
import { OnboardingStep } from "@/features/onboarding";
import { extractUserName } from "@/shared/lib/extractUserName";
import { OnboardingFrame } from "@/widgets/onboarding";
import { Button } from "@/shared/ui";
import { useNavigate } from "react-router-dom";

export const OnboardingWelcome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const widgetData = {
    title: `Welcome, ${extractUserName(user?.userName)}!`,
    body: "Let's set up your profile. It will take a few minutes. You can update your information later.",
    step: OnboardingStep.WELCOME,
    showProgress: true,
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <OnboardingFrame {...widgetData}>
        <div className="flex justify-center pt-4 border-t border-white/10 mt-auto pb-2">
          <Button
            variant="glass-primary"
            size="lg"
            onClick={() => navigate("/onboarding/currency")}
            className="px-[8rem] shadow-none"
          >
            Get Started
          </Button>
        </div>
      </OnboardingFrame>
    </div>
  );
};
