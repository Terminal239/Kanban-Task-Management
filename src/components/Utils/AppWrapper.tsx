import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const AppWrapper = ({ children }: Props) => {
  return <main className="relative flex bg-magenta-200 dark:bg-magenta-800">{children}</main>;
};

export default AppWrapper;
