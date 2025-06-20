
import { useState, useEffect } from 'react';

const BRAND_HOOKS = [
  "Finally. Internet that doesn't hate you.",
  "We're not Comcast.",
  "Internet built by humans, not algorithms.",
  "No contracts. No credit checks. No BS.",
  "Internet that just works. Imagine that.",
  "Your neighbors already switched. Join them."
];

export const useRotatingHook = () => {
  const [currentHook, setCurrentHook] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const randomHook = BRAND_HOOKS[Math.floor(Math.random() * BRAND_HOOKS.length)];
    setCurrentHook(randomHook);
    
    // Add a small delay for fade-in animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return { currentHook, isVisible };
};
