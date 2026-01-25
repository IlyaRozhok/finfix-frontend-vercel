import { OnboardingHeader } from "@/widgets/header";
import { Outlet } from "react-router-dom";
import bankCardImage from "../../assets/bg-test.avif";

const OnboardingLayout: React.FC = () => {
  return (
    <div
      className="text-white min-h-screen bg-cover bg-no-repeat bg-center bg-fixed"
      style={{
        backgroundImage: `url(${bankCardImage})`,
        backgroundPosition: "top left ",
      }}
    >
      <OnboardingHeader />
        <Outlet />

    </div>
  );
};

export default OnboardingLayout;
