import { ReactNode } from "react";

interface Props {
  type: "primary" | "secondary" | "tertiary" | "desctructive" | "text";
  children: ReactNode;
  additionalClasses?: string;
  inForm?: boolean;
  handleClick?: () => void;
}

const Button = ({ children, type, additionalClasses, inForm, handleClick }: Props) => {
  const baseClasses = `transition-all rounded-full text-center leading-none px-4 py-2 md:px-6 md:py-[12px] font-bold ${additionalClasses}`;

  switch (type) {
    case "primary":
      return (
        <button type={inForm ? "submit" : "button"} onClick={handleClick} className={`${baseClasses} bg-magenta-400 text-white hover:bg-magenta-200 hover:text-magenta-400`}>
          {children}
        </button>
      );
    case "secondary":
      return (
        <button type={inForm ? "submit" : "button"} onClick={handleClick} className={`${baseClasses}`}>
          {children}
        </button>
      );
    case "tertiary":
      return (
        <button type={inForm ? "submit" : "button"} onClick={handleClick} className={`${baseClasses} hover:bg-text hover:text-magenta-900`}>
          {children}
        </button>
      );
    case "desctructive":
      return (
        <button type={inForm ? "submit" : "button"} onClick={handleClick} className={`${baseClasses} bg-red-400 text-white hover:bg-red-200 hover:text-red-400`}>
          {children}
        </button>
      );
    case "text":
      return (
        <button type={inForm ? "submit" : "button"} onClick={handleClick} className={`w-full px-6 py-1 text-left ${additionalClasses}`}>
          {children}
        </button>
      );
    default:
      return (
        <button type={inForm ? "submit" : "button"} onClick={handleClick}>
          {children}
        </button>
      );
  }
};

export default Button;
