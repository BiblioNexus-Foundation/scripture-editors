import { useState, useEffect } from "react";

export const useResponsive = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      clearTimeout(timeoutId); // Clear any existing timeout

      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth < breakpoint);
      }, 250); // Debounce delay of 250ms
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId); // Clear timeout on unmount
    };
  }, [breakpoint]); // Only breakpoint as dependency

  return isMobile;
};

export default useResponsive;
