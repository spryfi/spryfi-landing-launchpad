
import { useState } from 'react';

export const useCheckoutModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    console.log('🎯 Opening checkout modal - will reset flow state');
    setIsOpen(true);
  };
  
  const closeModal = () => {
    console.log('❌ Closing checkout modal');
    setIsOpen(false);
  };

  return {
    isOpen,
    openModal,
    closeModal
  };
};
