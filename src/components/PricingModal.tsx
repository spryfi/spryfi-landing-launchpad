
import React, { useState } from 'react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  const [invitationCode, setInvitationCode] = useState('');
  const [codeApplied, setCodeApplied] = useState(false);
  const [discount, setDiscount] = useState<{ type: string; amount: number } | null>(null);

  const validateInvitationCode = async () => {
    if (invitationCode.trim()) {
      setCodeApplied(true);
      setDiscount({ type: 'discount', amount: 20 });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        style={{
          width: '480px',
          height: '600px',
          backgroundColor: '#0047AB',
          transform: 'none',
          borderRadius: '12px',
          boxShadow: `
            0 25px 50px rgba(0, 0, 0, 0.6),
            0 10px 20px rgba(0, 0, 0, 0.3),
            0 0 20px rgba(0, 71, 171, 0.15)
          `,
          filter: 'drop-shadow(0 8px 16px rgba(0, 71, 171, 0.2))'
        }}
        className="relative rounded-xl overflow-hidden"
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-white hover:text-gray-200 text-xl font-light z-10 transition-all duration-200 hover:scale-110"
        >
          ×
        </button>

        <div className="px-6 py-6 h-full flex flex-col">
          <div className="text-white text-lg font-normal mb-6 text-center">
            SpryFi
          </div>
          <h2 className="text-white text-xl font-bold mb-6 text-center">
            Choose Your Plan
          </h2>

          <div className="space-y-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <h3 className="text-blue-700 font-bold text-lg">SpryFi Essential</h3>
              <p className="text-gray-600 text-sm mb-2">Perfect for everyday use</p>
              <div className="text-blue-700 font-bold text-2xl">
                ${codeApplied && discount ? (99.95 - discount.amount).toFixed(2) : '99.95'}/mo
                {codeApplied && <span className="text-sm text-green-600 ml-2">Discount Applied!</span>}
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-lg">
              <h3 className="text-blue-700 font-bold text-lg">SpryFi Premium</h3>
              <p className="text-gray-600 text-sm mb-2">For power users and families</p>
              <div className="text-blue-700 font-bold text-2xl">
                ${codeApplied && discount ? (139.95 - discount.amount).toFixed(2) : '139.95'}/mo
                {codeApplied && <span className="text-sm text-green-600 ml-2">Discount Applied!</span>}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-white text-sm font-medium mb-2 block">Invitation Code (Optional)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value)}
                placeholder="Enter invitation code"
                className="flex-1 px-3 py-2 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button
                onClick={validateInvitationCode}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                {codeApplied ? '✓' : 'Apply'}
              </button>
            </div>
            {codeApplied && (
              <p className="text-green-200 text-xs mt-1">Code applied successfully!</p>
            )}
          </div>

          <p className="text-blue-100 text-sm text-center mb-4">
            Additional discounts may be available
          </p>

          <button className="w-full py-3 bg-blue-200 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg transition-colors">
            Continue with Selected Plan
          </button>
        </div>
      </div>
    </div>
  );
};
