
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
      className="fixed inset-0 flex items-center justify-center z-50 modal-backdrop p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}
    >
      <div 
        style={{
          width: '520px',
          minHeight: 'auto',
          height: 'auto',
          maxHeight: '90vh',
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
        className="relative rounded-xl modal-container max-w-full overflow-y-auto"
      >
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-white hover:text-gray-200 text-2xl font-light z-10 transition-all duration-200 hover:scale-110"
        >
          ×
        </button>

        <div className="px-8 py-8 flex flex-col min-h-full">
          {/* Enhanced SpryFi Branding */}
          <div className="text-center mb-10">
            <div className="text-white text-5xl font-bold mb-4">
              SpryFi
            </div>
            <div className="text-blue-100 text-lg font-medium">
              Internet that just works
            </div>
          </div>

          <h2 className="text-white text-3xl font-bold mb-10 text-center">
            Choose Your Plan
          </h2>

          <div className="space-y-8 mb-10 flex-grow">
            {/* Essential Plan */}
            <div
              className={`bg-white rounded-lg p-8 text-center cursor-pointer border-4 transition-all shadow-md ${
                selectedPlan === 'essential' 
                  ? 'border-green-500 shadow-xl transform scale-105' 
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-lg'
              }`}
              onClick={() => handlePlanSelect('essential')}
            >
              <h3 className="text-blue-700 font-bold text-2xl mb-3">SpryFi Essential</h3>
              <p className="text-gray-600 text-lg mb-3">Perfect for everyday use</p>
              <p className="text-blue-500 text-lg font-medium mb-4">100+ Megabits</p>
              <div className="text-blue-700 font-bold text-4xl mb-4">
                ${codeApplied && discount ? (99.95 - discount.amount).toFixed(2) : '99.95'}/mo
                {codeApplied && <span className="text-base text-green-600 ml-2 block mt-2">Discount Applied!</span>}
              </div>
              
              {/* Selection indicator */}
              {selectedPlan === 'essential' && (
                <div className="mt-5">
                  <div className="bg-green-500 text-white text-base px-5 py-3 rounded-full inline-flex items-center font-medium">
                    <span className="mr-2">✓</span> Selected
                  </div>
                </div>
              )}
            </div>

            {/* Premium Plan */}
            <div
              className={`bg-white rounded-lg p-8 text-center cursor-pointer border-4 transition-all shadow-md ${
                selectedPlan === 'premium' 
                  ? 'border-green-500 shadow-xl transform scale-105' 
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-lg'
              }`}
              onClick={() => handlePlanSelect('premium')}
            >
              <h3 className="text-blue-700 font-bold text-2xl mb-3">SpryFi Premium</h3>
              <p className="text-gray-600 text-lg mb-3">For power users and families</p>
              <p className="text-blue-500 text-lg font-medium mb-4">200+ Megabits</p>
              <div className="text-blue-700 font-bold text-4xl mb-4">
                ${codeApplied && discount ? (139.95 - discount.amount).toFixed(2) : '139.95'}/mo
                {codeApplied && <span className="text-base text-green-600 ml-2 block mt-2">Discount Applied!</span>}
              </div>
              
              {/* Selection indicator */}
              {selectedPlan === 'premium' && (
                <div className="mt-5">
                  <div className="bg-green-500 text-white text-base px-5 py-3 rounded-full inline-flex items-center font-medium">
                    <span className="mr-2">✓</span> Selected
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mb-8">
            <label className="text-white text-lg font-medium mb-4 block">Invitation Code (Optional)</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value)}
                placeholder="Enter invitation code"
                className="flex-1 px-4 py-3 rounded-lg text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button
                onClick={validateInvitationCode}
                className="px-5 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                {codeApplied ? '✓' : 'Apply'}
              </button>
            </div>
            {codeApplied && (
              <p className="text-green-200 text-sm mt-2">Code applied successfully!</p>
            )}
          </div>

          <p className="text-blue-100 text-lg text-center mb-8">
            Additional discounts may be available
          </p>

          <button 
            onClick={handleContinue}
            disabled={!selectedPlan || isSubmitting}
            className={`w-full py-5 font-semibold text-xl rounded-lg transition-all mb-4 ${
              selectedPlan && !isSubmitting
                ? 'bg-blue-200 hover:bg-blue-100 text-blue-700 cursor-pointer shadow-md hover:shadow-lg' 
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
