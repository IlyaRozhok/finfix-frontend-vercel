import React from "react";
import logoWhite from "@/assets/logo.png";
import { OnboardingUserMenu } from "./OnboardingUserMenu";

type HeaderProps = {
  title?: string;
  showMenuButton?: boolean;
};

export const OnboardingHeader: React.FC<HeaderProps> = ({
  title = "Finfix",
}) => {
  return (
    <header className="px-10 flex items-center justify-between h-14 ">
      <div className="flex gap-2">
        <div className="text-xl text-black font-semibold tracking-tight pt-1">
          {title}
        </div>
        <img src={logoWhite} alt="logo" className="w-10" />
      </div>
      <OnboardingUserMenu />
    </header>
  );
};
