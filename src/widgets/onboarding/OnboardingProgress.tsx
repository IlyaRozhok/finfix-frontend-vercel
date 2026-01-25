import { OnboardingStep, ONBOARDING_STEPS } from "@/features/onboarding";
import clsx from "clsx";

interface OnboardingProgressProps {
  currentStep: OnboardingStep;
  allCompleted?: boolean;
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  currentStep,
  allCompleted = false,
}) => {
  const currentStepIndex = ONBOARDING_STEPS.findIndex(
    (step) => step.id === currentStep
  );
  const progress = allCompleted 
    ? 100 
    : ((currentStepIndex + 1) / ONBOARDING_STEPS.length) * 100;

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-500 ease-out rounded-full"
          style={{ 
            width: `${progress}%`,
            background: 'linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
            boxShadow: '0 0 8px rgba(255, 255, 255, 0.3), 0 0 16px rgba(255, 255, 255, 0.15)'
          }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex justify-between items-start mt-3 gap-1 sm:gap-2">
        {ONBOARDING_STEPS.map((step, index) => {
          const isCompleted = allCompleted ? true : index < currentStepIndex;
          const isCurrent = allCompleted ? false : index === currentStepIndex;
          const isUpcoming = allCompleted ? false : index > currentStepIndex;

          return (
            <div
              key={step.id}
              className="flex flex-col items-center flex-1 min-w-0"
            >
              <div
                className={clsx(
                  "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-semibold transition-all duration-300 flex-shrink-0",
                  isCompleted &&
                    "text-white",
                  isCurrent &&
                    "bg-white/20 backdrop-blur-sm border-2 text-white ring-2",
                  isUpcoming && "bg-white/5 text-slate-400 border border-white/10"
                )}
                style={isCompleted ? {
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                  boxShadow: '0 0 12px rgba(255, 255, 255, 0.4), 0 0 24px rgba(255, 255, 255, 0.2)'
                } : isCurrent ? {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  ringColor: 'rgba(255, 255, 255, 0.2)'
                } : {}}
              >
                {isCompleted ? (
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={clsx(
                  "text-[10px] sm:text-xs mt-1.5 text-center w-full truncate transition-colors px-0.5",
                  isCurrent
                    ? "text-white font-semibold"
                    : isCompleted
                    ? "text-primary-background/90 font-medium"
                    : "text-primary-background/50"
                )}
                title={step.title}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
