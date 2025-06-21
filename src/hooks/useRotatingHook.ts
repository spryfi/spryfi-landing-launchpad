
import { useState, useEffect } from 'react';

const BRAND_HOOKS = [
  "Finally. Internet that doesn't hate you.",
  "We're not Comcast.",
  "Internet built by humans, not algorithms.",
  "The internet you deserve. Not the internet you're stuck with.",
  "We don't have shareholders. We have neighbors."
];

export const useRotatingHook = () => {
  const [currentHook, setCurrentHook] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Pick a random hook on initial load
    const randomIndex = Math.floor(Math.random() * BRAND_HOOKS.length);
    setCurrentHook(BRAND_HOOKS[randomIndex]);
    setIsVisible(true);
  }, []);

  return { 
    currentHook, 
    isVisible 
  };
};
