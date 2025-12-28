import React from "react";
import {
  HomeIcon,
  ShoppingBagIcon,
  TruckIcon,
  HeartIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  WifiIcon,
  LightBulbIcon,
  ShoppingCartIcon,
  CakeIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

interface CategoryIconProps {
  iconName?: string;
  className?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  home: HomeIcon,
  shopping: ShoppingBagIcon,
  car: TruckIcon,
  transport: TruckIcon,
  heart: HeartIcon,
  academic: AcademicCapIcon,
  education: AcademicCapIcon,
  briefcase: BriefcaseIcon,
  work: BriefcaseIcon,
  banknotes: BanknotesIcon,
  finance: BanknotesIcon,
  phone: DevicePhoneMobileIcon,
  communication: DevicePhoneMobileIcon,
  wifi: WifiIcon,
  internet: WifiIcon,
  lightbulb: LightBulbIcon,
  utilities: LightBulbIcon,
  cart: ShoppingCartIcon,
  groceries: ShoppingCartIcon,
  cake: CakeIcon,
  entertainment: CakeIcon,
  // Default fallback
  default: SparklesIcon,
};

export function CategoryIcon({ iconName, className = "h-5 w-5" }: CategoryIconProps) {
  const IconComponent = iconName ? iconMap[iconName.toLowerCase()] || iconMap.default : iconMap.default;

  return <IconComponent className={className} />;
}
