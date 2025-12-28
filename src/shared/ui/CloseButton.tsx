import React from "react";

type CloseButton = {
  handleClose: () => void;
  fill?: "black" | "white";
};
export const CloseButton: React.FC<CloseButton> = ({
  handleClose,
  fill = "black",
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill={fill}
      viewBox="0 0 24 24"
      strokeWidth={1}
      stroke={fill === "black" ? "white" : "black"}
      className="size-6 cursor-pointer hover:scale-110"
      onClick={handleClose}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );
};
