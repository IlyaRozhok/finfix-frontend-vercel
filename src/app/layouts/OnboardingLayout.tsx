import { OnboardingHeader } from "@/widgets/header";
import { Outlet } from "react-router-dom";
import bankCardImage from "../../assets/bank-card.jpg";

const OnboardingLayout: React.FC = () => {
  return (
    <div
      className="text-white md:bg-top h-full bg-cover bg-no-repeat"
      style={{
        backgroundImage: `url(${bankCardImage})`,
        backgroundPosition: "top left 100px",
      }}
    >
      <OnboardingHeader />
      <div className="p-[5%]">
        <Outlet />
      </div>
    </div>
  );
};

export default OnboardingLayout;
