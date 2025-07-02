import React, { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const FlashSaleBanner = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [saleActive, setSaleActive] = useState(true);
  const [saleEndDate, setSaleEndDate] = useState<Date | null>(null);

  // Initialize sale end date
  useEffect(() => {
    const storedEndDate = localStorage.getItem('spryfi_sale_end');
    
    if (storedEndDate) {
      const endDate = new Date(storedEndDate);
      if (endDate > new Date()) {
        setSaleEndDate(endDate);
      } else {
        // Sale has ended
        setSaleActive(false);
        localStorage.removeItem('spryfi_sale_end');
      }
    } else {
      // First visit - set sale end date (7 days from now)
      const newEndDate = new Date();
      newEndDate.setDate(newEndDate.getDate() + 7);
      setSaleEndDate(newEndDate);
      localStorage.setItem('spryfi_sale_end', newEndDate.toISOString());
    }
  }, []);

  // Calculate time left
  const calculateTimeLeft = (): TimeLeft | null => {
    if (!saleEndDate) return null;
    
    const difference = saleEndDate.getTime() - new Date().getTime();
    
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }
    return null;
  };

  // Update timer every second
  useEffect(() => {
    if (!saleEndDate) return;

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      if (!newTimeLeft) {
        setSaleActive(false);
        localStorage.removeItem('spryfi_sale_end');
      }
    }, 1000);

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [saleEndDate]);

  if (!saleActive || !timeLeft) return null;

  return (
    <div className="flash-sale-banner">
      <div className="max-w-6xl mx-auto px-6">
        <div className="sale-content">
          <div className="sale-header">
            <span className="flash-icon">⚡</span>
            <h2 className="sale-title">LIMITED TIME: Lock in $10 OFF Forever!</h2>
            <span className="flash-icon">⚡</span>
          </div>
          
          <p className="sale-subtitle">
            Sign up now and save $10/month for LIFE. No fine print. No price increases. Ever.
          </p>
          
          <div className="countdown-container">
            <div className="countdown-label">OFFER ENDS IN:</div>
            <div className="countdown-timer">
              <div className="time-unit">
                <span className="time-value">{timeLeft.days}</span>
                <span className="time-label">DAYS</span>
              </div>
              <span className="separator">:</span>
              <div className="time-unit">
                <span className="time-value">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="time-label">HOURS</span>
              </div>
              <span className="separator">:</span>
              <div className="time-unit">
                <span className="time-value">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="time-label">MINS</span>
              </div>
              <span className="separator">:</span>
              <div className="time-unit">
                <span className="time-value">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="time-label">SECS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};