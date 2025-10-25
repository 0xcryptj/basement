import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export const Container = ({ children, className = "" }: ContainerProps) => {
  return (
    <div className={`max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 ${className}`}>
      {children}
    </div>
  );
};
