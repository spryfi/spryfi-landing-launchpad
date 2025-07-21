interface UserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  address?: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    phone?: string;
  };
}

const USER_DATA_KEY = 'spryfi_user_data';

export const saveUserData = (data: Partial<UserData>) => {
  try {
    const existingData = loadUserData();
    const updatedData = { ...existingData, ...data };
    
    // Merge address data if provided
    if (data.address) {
      updatedData.address = { ...existingData.address, ...data.address };
    }
    
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedData));
    console.log('💾 User data saved:', updatedData);
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

export const loadUserData = (): UserData => {
  try {
    const data = localStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error loading user data:', error);
    return {};
  }
};

export const clearUserData = () => {
  try {
    localStorage.removeItem(USER_DATA_KEY);
    console.log('🗑️ User data cleared');
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
};

export const hasUserData = (): boolean => {
  const data = loadUserData();
  return !!(data.firstName || data.lastName || data.email || data.address?.addressLine1);
};