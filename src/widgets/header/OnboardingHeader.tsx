import React from "react";
import { Header } from "@/shared/ui";

type HeaderProps = {
  title?: string;
  showMenuButton?: boolean;
};

export const OnboardingHeader: React.FC<HeaderProps> = ({
  title = "FinFix",
}) => {
  return <Header title={title} theme="admin" showModeSwitcher={false} />;
};
