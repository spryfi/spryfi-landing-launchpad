import React from "react";
import { useNavigate } from "react-router-dom";

export function AddressSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-900 to-blue-500 text-white">
      <h1 className="text-3xl font-bold mb-4 text-white">
        Address Qualified!
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
    </div>
  );
}