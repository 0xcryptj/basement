import { useEffect, useState } from "react";

export const useViewport = () => {
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  return {
    width,
    isMobile: width < 640,
    isTablet: width >= 640 && width < 1024,
    isDesktop: width >= 1024,
    isUltrawide: width >= 1920,
  };
};
