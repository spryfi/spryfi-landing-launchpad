
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
    // TODO: API call to validate code and get benefits
    // For now, simulate validation
    if (invitationCode.trim()) {
      setCodeApplied(true);
      setDiscount({ type: 'discount', amount: 20 }); // Example
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
          transform: 'perspective(1000px) rotateY(-5deg)',
          boxShadow: `
            0 25px 50px rgba(0, 0, 0, 0.6),
            0 12px 24px rgba(0, 0, 0, 0.4),
            0 6px 12px rgba(0, 0, 0, 0.3)
          `,
          filter: 'drop-shadow(0 0 20px rgba(0, 71, 171, 0.3))',
          transformStyle: 'preserve-3d'
        }}
        className="relative rounded-xl overflow-hidden"
      >
        {/* Enhanced 3D depth layer */}
        <div 
          className="absolute inset-0 rounded-xl"
          style={{
            backgroundColor: '#003a94',
            transform: 'translateZ(-8px)',
            zIndex: -1
          }}
        />
        
        {/* Close button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-white hover:text-gray-200 text-xl font-light z-10 transition-all duration-200 hover:scale-110"
          style={{
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}
        >
          ×
        </button>

        {/* Content */}
        <div 
          className="px-6 py-6 h-full flex flex-col"
          style={{
            transform: 'translateZ(2px)'
          }}
        >
          
          {/* Header */}
          <div 
            className="text-white text-lg font-normal mb-6 text-center"
            style={{
              textShadow: '0 0 10px rgba(255, 255, 255, 0.3)'
            }}
          >
            SpryFi
          </div>
          <h2 
            className="text-white text-xl font-bold mb-6 text-center"
            style={{
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
            }}
          >
            Choose Your Plan
          </h2>

          {/* Plans */}
          <div className="space-y-4 mb-6">
            
            {/* Essential Plan */}
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <h3 className="text-blue-700 font-bold text-lg">SpryFi Essential</h3>
              <p className="text-gray-600 text-sm mb-2">Perfect for everyday use</p>
              <div className="text-blue-700 font-bold text-2xl">
                ${codeApplied && discount ? (99.95 - discount.amount).toFixed(2) : '99.95'}/mo
                {codeApplied && <span className="text-sm text-green-600 ml-2">Discount Applied!</span>}
              </div>
            </div>

            {/* Premium Plan */}
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <h3 className="text-blue-700 font-bold text-lg">SpryFi Premium</h3>
              <p className="text-gray-600 text-sm mb-2">For power users and families</p>
              <div className="text-blue-700 font-bold text-2xl">
                ${codeApplied && discount ? (139.95 - discount.amount).toFixed(2) : '139.95'}/mo
                {codeApplied && <span className="text-sm text-green-600 ml-2">Discount Applied!</span>}
              </div>
            </div>
          </div>

          {/* Invitation Code */}
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

          {/* Note */}
          <p 
            className="text-blue-100 text-sm text-center mb-4"
            style={{
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
            }}
          >
            Additional discounts may be available
          </p>

          {/* Continue Button */}
          <button 
            className="w-full py-3 bg-blue-200 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg transition-colors"
            style={{
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              transform: 'translateZ(2px)',
              transformStyle: 'preserve-3d'
            }}
          >
            Continue with Selected Plan
          </button>

        </div>
      </div>
    </div>
  );
};
