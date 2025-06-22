
import { useState } from 'react';

export const useCheckoutModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  // REMOVED: Auto-launch timer that was causing unwanted modal behavior
  // Users should have full control over when the modal opens

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return {
    isOpen,
    openModal,
    closeModal
  };
};
