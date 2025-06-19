
import { useState, useEffect } from 'react';

export const useCheckoutModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Auto-launch modal after 10 seconds
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return {
    isOpen,
    openModal,
    closeModal
  };
};
