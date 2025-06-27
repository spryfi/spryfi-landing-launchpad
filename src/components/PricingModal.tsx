
import React, { useState } from 'react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  const [invitationCode, setInvitationCode] = useState('');
  const [codeApplied, setCodeApplied] = useState(false);
  const [discount, setDiscount] = useState<{ type: string; amount: number } | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateInvitationCode = async () => {
    if (invitationCode.trim()) {
      setCodeApplied(true);
      setDiscount({ type: 'discount', amount: 20 });
    }
  };

  const handlePlanSelect = (planType: string) => {
    setSelectedPlan(planType);
    console.log('Selected plan:', planType);
  };

  const handleContinue = async () => {
    if (!selectedPlan) {
      alert('Please select a plan first');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // For now, just simulate saving - you can integrate with your actual API later
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Plan saved:', {
        selected_plan: selectedPlan,
        plan_price: selectedPlan === 'essential' ? 99.95 : 139.95,
        discount_applied: codeApplied ? discount?.amount : 0
      });
      
      // Close modal and proceed to next step
      onClose();
      alert(`${selectedPlan === 'essential' ? 'Essential' : 'Premium'} plan selected! Proceeding to next step.`);
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('Error saving plan. Please try again.');
    }
    
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 modal-backdrop"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}
    >
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
        className="relative rounded-xl overflow-hidden modal-container"
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-white hover:text-gray-200 text-xl font-light z-10 transition-all duration-200 hover:scale-110"
        >
          ×
        </button>

        <div className="px-6 py-6 h-full flex flex-col">
          {/* Enhanced SpryFi Branding */}
          <div className="text-center mb-6">
            <div className="text-white text-3xl font-bold mb-2">
              SpryFi
            </div>
            <div className="text-blue-100 text-sm font-medium">
              Internet that just works
            </div>
          </div>

          <h2 className="text-white text-xl font-bold mb-6 text-center">
            Choose Your Plan
          </h2>

          <div className="space-y-4 mb-6">
            {/* Essential Plan */}
            <div
              className={`bg-white rounded-lg p-4 text-center cursor-pointer border-4 transition-all ${
                selectedPlan === 'essential' 
                  ? 'border-green-500 shadow-lg transform scale-105' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => handlePlanSelect('essential')}
            >
              <h3 className="text-blue-700 font-bold text-lg">SpryFi Essential</h3>
              <p className="text-gray-600 text-sm mb-1">Perfect for everyday use</p>
              <p className="text-blue-500 text-sm font-medium mb-2">100+ Megabits</p>
              <div className="text-blue-700 font-bold text-2xl">
                ${codeApplied && discount ? (99.95 - discount.amount).toFixed(2) : '99.95'}/mo
                {codeApplied && <span className="text-sm text-green-600 ml-2">Discount Applied!</span>}
              </div>
              
              {/* Selection indicator */}
              {selectedPlan === 'essential' && (
                <div className="mt-3">
                  <div className="bg-green-500 text-white text-sm px-3 py-1 rounded-full inline-flex items-center">
                    <span className="mr-1">✓</span> Selected
                  </div>
                </div>
              )}
            </div>

            {/* Premium Plan */}
            <div
              className={`bg-white rounded-lg p-4 text-center cursor-pointer border-4 transition-all ${
                selectedPlan === 'premium' 
                  ? 'border-green-500 shadow-lg transform scale-105' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => handlePlanSelect('premium')}
            >
              <h3 className="text-blue-700 font-bold text-lg">SpryFi Premium</h3>
              <p className="text-gray-600 text-sm mb-1">For power users and families</p>
              <p className="text-blue-500 text-sm font-medium mb-2">200+ Megabits</p>
              <div className="text-blue-700 font-bold text-2xl">
                ${codeApplied && discount ? (139.95 - discount.amount).toFixed(2) : '139.95'}/mo
                {codeApplied && <span className="text-sm text-green-600 ml-2">Discount Applied!</span>}
              </div>
              
              {/* Selection indicator */}
              {selectedPlan === 'premium' && (
                <div className="mt-3">
                  <div className="bg-green-500 text-white text-sm px-3 py-1 rounded-full inline-flex items-center">
                    <span className="mr-1">✓</span> Selected
                  </div>
                </div>
              )}
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

          <button 
            onClick={handleContinue}
            disabled={!selectedPlan || isSubmitting}
            className={`w-full py-3 font-semibold rounded-lg transition-all ${
              selectedPlan && !isSubmitting
                ? 'bg-blue-200 hover:bg-blue-100 text-blue-700 cursor-pointer' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Saving...' : 
             selectedPlan ? `Continue with ${selectedPlan === 'essential' ? 'Essential' : 'Premium'} Plan` : 
             'Select a Plan to Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};
