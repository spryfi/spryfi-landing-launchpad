
import { useState, useEffect } from 'react';

const BRAND_HOOKS = [
  "Finally. Internet that doesn't hate you.",
  "We're not Comcast.",
  "Internet built by humans, not algorithms.",
  "The internet you deserve. Not the internet you're stuck with.",
  "We don't have shareholders. We have neighbors."
];

export const useRotatingHook = () => {
  // Always call hooks at the top level - no conditions
  const [currentHook, setCurrentHook] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Ensure we have a stable initial state
    if (!currentHook) {
      const randomIndex = Math.floor(Math.random() * BRAND_HOOKS.length);
      setCurrentHook(BRAND_HOOKS[randomIndex]);
      
      // Use setTimeout to ensure proper timing
      setTimeout(() => {
        setIsVisible(true);
      }, 100);
    }
  }, []); // Empty dependency array to run only once

  return { 
    currentHook, 
    isVisible 
  };
};
