
export const saveAddressToStorage = (address: string) => {
  if (address) {
    const formData = {
      address,
      timestamp: Date.now()
    };
    localStorage.setItem('addressFormData', JSON.stringify(formData));
  }
};

export const loadAddressFromStorage = (): string => {
  const savedData = localStorage.getItem('addressFormData');
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      // Only restore if saved within last hour to avoid stale data
      if (parsed.timestamp && Date.now() - parsed.timestamp < 3600000) {
        return parsed.address || '';
      }
    } catch (error) {
      console.error('Error restoring form data:', error);
    }
  }
  return '';
};

export const clearAddressFromStorage = () => {
  localStorage.removeItem('addressFormData');
};
