import { useAuth } from "@/app/providers/AuthProvider";
import { OnboardingStep } from "@/features/onboarding";
import { extractUserName } from "@/shared/lib/extractUserName";
import { OnboardingFrame } from "@/widgets/onboarding";

export const OnboardingWelcome = () => {
  const { user } = useAuth();

  const widgetData = {
    title: `${OnboardingStep.WELCOME}, ${extractUserName(user?.userName)}!`,
    body: "Let's set up your profile. It will take a few minutes. You can update your information later.",
    step: OnboardingStep.WELCOME,
  };

  return (
    <div className="flex justify-center item-center">
      <OnboardingFrame {...widgetData} />
    </div>
  );
};
