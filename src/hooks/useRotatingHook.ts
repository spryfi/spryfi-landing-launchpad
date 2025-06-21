
import { useState, useEffect } from 'react';

const BRAND_HOOKS = [
  "Finally. Internet that doesn't hate you.",
  "We're not Comcast.",
  "Internet built by humans, not algorithms.",
  "The internet you deserve. Not the internet you're stuck with.",
  "We don't have shareholders. We have neighbors."
];

export const useRotatingHook = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Set initial hook
    setIsVisible(true);

    // Set up rotation every 4 seconds
    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % BRAND_HOOKS.length);
        setIsVisible(true);
      }, 500); // 0.5 second fade out before changing text
    }, 4000); // Rotate every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return { 
    currentHook: BRAND_HOOKS[currentIndex], 
    isVisible 
  };
};
