

export const generateGuestId = (): string => {
  
  let guestId = localStorage.getItem("guestId");

  if (!guestId) {
    
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem("guestId", guestId);
  }

  return guestId;
};

export const getGuestId = (): string => {
  return localStorage.getItem("guestId") || generateGuestId();
};
