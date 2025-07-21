import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function AddressSuccess() {
  const navigate = useNavigate();
  const [minsignal, setMinsignal] = useState<number | null>(null);

  useEffect(() => {
    // Get qualification data from sessionStorage
    const qualificationData = sessionStorage.getItem('qualification_result');
    if (qualificationData) {
      try {
        const data = JSON.parse(qualificationData);
        if (data.qualified && typeof data.minsignal === 'number') {
          setMinsignal(data.minsignal);
        }
      } catch (error) {
        console.error('Error parsing qualification data:', error);
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-900 to-blue-500 text-white">
      <h1 className="text-3xl font-bold mb-4 text-white">
        Welcome to SpryFi Home!
      </h1>
      <p className="text-lg text-white">
        Great news—your address is covered by SpryFi Home.
      </p>
      <button
        onClick={() => navigate('/plans')}
        className="mt-8 px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-gray-100 transition"
      >
        Choose Your Plan
      </button>
      
      {minsignal !== null && (
        <div className="absolute bottom-4 left-4">
          <p className="text-xs text-gray-400">
            SS{minsignal}
          </p>
        </div>
      )}
    </div>
  );
}