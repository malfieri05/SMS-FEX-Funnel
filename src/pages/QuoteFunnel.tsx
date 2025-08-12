import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { funeralCostsByState } from "./funeralCostsByState";
import { getNationalQuote, getCashValueTable } from "./csvQuoteUtils";

interface FunnelStep {
  id: number;
  title: string;
  description: string;
}

const funnelSteps: FunnelStep[] = [
  { id: 1, title: "Location & Service", description: "Select your state and burial preference" },
  { id: 2, title: "Health Question 1", description: "Tobacco use in past 12 months" },
  { id: 3, title: "Health Question 2", description: "COPD or asthma" },
  { id: 4, title: "Health Question 3", description: "Kidney or liver disease" },
  { id: 5, title: "Health Question 4", description: "Heart attack, stroke, or cancer" },
  { id: 6, title: "Health Question 5", description: "Diabetes or pre-diabetes" },
  { id: 7, title: "Health Question 6", description: "Major surgeries in last 5 years" },
  { id: 8, title: "Get Your Quote", description: "Customize your coverage and see rates" },
];

const QuoteFunnel: React.FC = () => {
  // Modal state
  const [showFunnel, setShowFunnel] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form data
  const [selectedState, setSelectedState] = useState("");
  const [burialType, setBurialType] = useState("");
  const [healthAnswers, setHealthAnswers] = useState({
    q1: null as string | null,
    q2: null as string | null,
    q3: null as string | null,
    q4: null as string | null,
    q5: null as string | null,
    q6: null as string | null,
  });
  
  const [diabetesTreatment, setDiabetesTreatment] = useState<string>("");
  
  // Quote customization
  const [quoteGender, setQuoteGender] = useState<'male' | 'female'>('male');
  const [quoteAge, setQuoteAge] = useState(50);
  const [quoteCoverage, setQuoteCoverage] = useState(5000);
  const [healthTier, setHealthTier] = useState<'select1' | 'select2' | 'select3'>('select1');
  
  // Secure quote state
  const [showSecureModal, setShowSecureModal] = useState(false);

  // Auto-classify health tier based on answers
  useEffect(() => {
    if (!selectedState || !burialType) return;
    
    // Start with Select 1 (best tier)
    let tier = "select1";
    
    // Check each condition that affects tier
    if (healthAnswers.q2 === "yes") { // COPD or asthma
      tier = "select2";
    }
    
    if (healthAnswers.q3 === "yes") { // Kidney or liver disease
      tier = "select2";
    }
    
    if (healthAnswers.q4 === "yes") { // Heart attack, stroke, or cancer
      tier = "select2";
    }
    
    if (healthAnswers.q5 === "yes") { // Diabetes
      if (diabetesTreatment === "insulin") {
        tier = "select3"; // Guaranteed issue
      } else if (diabetesTreatment === "2+ medications") {
        tier = "select2";
      }
      // Metformin keeps current tier (no change)
    }
    
    if (healthAnswers.q6 === "yes") { // Major surgeries
      tier = "select2";
    }
    
    setHealthTier(tier as 'select1' | 'select2' | 'select3');
  }, [healthAnswers, diabetesTreatment, selectedState, burialType]);

  const states = funeralCostsByState.map(f => f.state).sort();

  // Get average cost for selected state and type
  const costData = funeralCostsByState.find(f => f.state === selectedState);
  let costRange: string | undefined = undefined;
  if (costData && burialType) {
    const [min, max] = burialType === "burial" ? costData.burial : costData.cremation;
    costRange = `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  }

  // Get quote
  const quote = selectedState && burialType
    ? getNationalQuote(quoteGender, quoteAge, quoteCoverage, healthTier)
    : null;

  const handleNext = () => {
    if (currentStep < funnelSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAnswerChange = (question: string, answer: string) => {
    setHealthAnswers(prev => ({
      ...prev,
      [question]: answer
    }));
    
    // Auto-advance to next step after a short delay
    // Only auto-advance for diabetes question (q5) if answer is "No"
    if (question === "q5") {
      if (answer === "no") {
        setTimeout(() => {
          if (currentStep < funnelSteps.length) {
            setCurrentStep(currentStep + 1);
          }
        }, 500);
      }
    } else {
      // Auto-advance for all other health questions
      setTimeout(() => {
        if (currentStep < funnelSteps.length) {
          setCurrentStep(currentStep + 1);
        }
      }, 500);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedState && burialType;
      case 2:
        return healthAnswers.q1 !== null;
      case 3:
        return healthAnswers.q2 !== null;
      case 4:
        return healthAnswers.q3 !== null;
      case 5:
        return healthAnswers.q4 !== null;
      case 6:
        return healthAnswers.q5 !== null && (healthAnswers.q5 === 'no' || (healthAnswers.q5 === 'yes' && diabetesTreatment !== ""));
      case 7:
        return healthAnswers.q6 !== null;
      case 8:
        return true; // Final step, can always proceed
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 md:space-y-6">
            <div className="text-center mb-4 md:mb-6">
              <h3 className="text-xl md:text-2xl font-bold text-blue-700 mb-2">Where are you located?</h3>
              <p className="text-sm md:text-base text-gray-600">This helps us show you accurate pricing for your area.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Your State</label>
                <select
                  className="w-full p-3 md:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                >
                  <option value="">Choose your state...</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
                <select
                  className="w-full p-3 md:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  value={burialType}
                  onChange={(e) => setBurialType(e.target.value)}
                >
                  <option value="">Burial or Cremation?</option>
                  <option value="burial">Burial</option>
                  <option value="cremation">Cremation</option>
                </select>
              </div>
              
              {costRange && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4">
                  <p className="text-sm md:text-base text-red-800 font-medium">
                    Average {burialType} cost in {selectedState}: <span className="font-bold">{costRange}</span>
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    *Source: National Funeral Directors Association, 2024
                  </p>
                </div>
              )}
            </div>
          </div>
        );

             case 2:
         return (
           <div className="space-y-4 md:space-y-6">
             <div className="text-center mb-4 md:mb-6">
               <h3 className="text-xl md:text-2xl font-bold text-blue-700 mb-2">Health Question 1</h3>
               <p className="text-sm md:text-base text-gray-600">Have you used tobacco in the last 12 months?</p>
             </div>
             
             <div className="flex gap-3 md:gap-4 justify-center">
               <button
                 className={`px-6 md:px-8 py-3 md:py-4 rounded-lg font-medium transition-colors text-base md:text-lg ${
                   healthAnswers.q1 === 'yes' 
                     ? 'bg-blue-600 text-white' 
                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                 }`}
                 onClick={() => handleAnswerChange('q1', 'yes')}
               >
                 Yes
               </button>
               <button
                 className={`px-6 md:px-8 py-3 md:py-4 rounded-lg font-medium transition-colors text-base md:text-lg ${
                   healthAnswers.q1 === 'no' 
                     ? 'bg-blue-600 text-white' 
                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                 }`}
                 onClick={() => handleAnswerChange('q1', 'no')}
               >
                 No
               </button>
             </div>
           </div>
         );

             case 3:
         return (
           <div className="space-y-4 md:space-y-6">
             <div className="text-center mb-4 md:mb-6">
               <h3 className="text-xl md:text-2xl font-bold text-blue-700 mb-2">Health Question 2</h3>
               <p className="text-sm md:text-base text-gray-600">Do you have COPD or asthma?</p>
             </div>
             
             <div className="flex gap-3 md:gap-4 justify-center">
               <button
                 className={`px-6 md:px-8 py-3 md:py-4 rounded-lg font-medium transition-colors text-base md:text-lg ${
                   healthAnswers.q2 === 'yes' 
                     ? 'bg-blue-600 text-white' 
                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                 }`}
                 onClick={() => handleAnswerChange('q2', 'yes')}
               >
                 Yes
               </button>
               <button
                 className={`px-6 md:px-8 py-3 md:py-4 rounded-lg font-medium transition-colors text-base md:text-lg ${
                   healthAnswers.q2 === 'no' 
                     ? 'bg-blue-600 text-white' 
                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                 }`}
                 onClick={() => handleAnswerChange('q2', 'no')}
               >
                 No
               </button>
             </div>
           </div>
         );

             case 4:
         return (
           <div className="space-y-4 md:space-y-6">
             <div className="text-center mb-4 md:mb-6">
               <h3 className="text-xl md:text-2xl font-bold text-blue-700 mb-2">Health Question 3</h3>
               <p className="text-sm md:text-base text-gray-600">Do you have any kidney or liver disease?</p>
             </div>
             
             <div className="flex gap-3 md:gap-4 justify-center">
               <button
                 className={`px-6 md:px-8 py-3 md:py-4 rounded-lg font-medium transition-colors text-base md:text-lg ${
                   healthAnswers.q3 === 'yes' 
                     ? 'bg-blue-600 text-white' 
                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                 }`}
                 onClick={() => handleAnswerChange('q3', 'yes')}
               >
                 Yes
               </button>
               <button
                 className={`px-6 md:px-8 py-3 md:py-4 rounded-lg font-medium transition-colors text-base md:text-lg ${
                   healthAnswers.q3 === 'no' 
                     ? 'bg-blue-600 text-white' 
                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                 }`}
                 onClick={() => handleAnswerChange('q3', 'no')}
               >
                 No
               </button>
             </div>
           </div>
         );

             case 5:
         return (
           <div className="space-y-4 md:space-y-6">
             <div className="text-center mb-4 md:mb-6">
               <h3 className="text-xl md:text-2xl font-bold text-blue-700 mb-2">Health Question 4</h3>
               <p className="text-sm md:text-base text-gray-600">Have you ever had a heart attack, stroke, or cancer?</p>
             </div>
             
             <div className="flex gap-3 md:gap-4 justify-center">
               <button
                 className={`px-6 md:px-8 py-3 md:py-4 rounded-lg font-medium transition-colors text-base md:text-lg ${
                   healthAnswers.q4 === 'yes' 
                     ? 'bg-blue-600 text-white' 
                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                 }`}
                 onClick={() => handleAnswerChange('q4', 'yes')}
               >
                 Yes
               </button>
               <button
                 className={`px-6 md:px-8 py-3 md:py-4 rounded-lg font-medium transition-colors text-base md:text-lg ${
                   healthAnswers.q4 === 'no' 
                     ? 'bg-blue-600 text-white' 
                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                 }`}
                 onClick={() => handleAnswerChange('q4', 'no')}
               >
                 No
               </button>
             </div>
           </div>
         );

             case 6:
         return (
           <div className="space-y-4 md:space-y-6">
             <div className="text-center mb-4 md:mb-6">
               <h3 className="text-xl md:text-2xl font-bold text-blue-700 mb-2">Health Question 5</h3>
               <p className="text-sm md:text-base text-gray-600">Have diabetes or are pre-diabetic?</p>
             </div>
             
             <div className="flex gap-3 md:gap-4 justify-center">
               <button
                 className={`px-6 md:px-8 py-3 md:py-4 rounded-lg font-medium transition-colors text-base md:text-lg ${
                   healthAnswers.q5 === 'yes' 
                     ? 'bg-blue-600 text-white' 
                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                 }`}
                 onClick={() => handleAnswerChange('q5', 'yes')}
               >
                 Yes
               </button>
               <button
                 className={`px-6 md:px-8 py-3 md:py-4 rounded-lg font-medium transition-colors text-base md:text-lg ${
                   healthAnswers.q5 === 'no' 
                     ? 'bg-blue-600 text-white' 
                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                 }`}
                 onClick={() => handleAnswerChange('q5', 'no')}
               >
                 No
               </button>
             </div>
             
             {healthAnswers.q5 === 'yes' && (
               <div className="mt-4 md:mt-6">
                 <label className="block text-sm font-medium text-gray-700 mb-2">Select your treatment type:</label>
                 <select
                   className="w-full p-3 md:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                   value={diabetesTreatment}
                   onChange={(e) => {
                     setDiabetesTreatment(e.target.value);
                     // Auto-advance when treatment type is selected
                     if (e.target.value) {
                       setTimeout(() => {
                         if (currentStep < funnelSteps.length) {
                           setCurrentStep(currentStep + 1);
                         }
                       }, 500);
                     }
                   }}
                 >
                   <option value="">Choose treatment type...</option>
                   <option value="insulin">Insulin</option>
                   <option value="metformin">Metformin</option>
                   <option value="3+ medications">3 or more oral medications</option>
                 </select>
               </div>
             )}
           </div>
         );

             case 7:
         return (
           <div className="space-y-4 md:space-y-6">
             <div className="text-center mb-4 md:mb-6">
               <h3 className="text-xl md:text-2xl font-bold text-blue-700 mb-2">Health Question 6</h3>
               <p className="text-sm md:text-base text-gray-600">Have you had any major surgeries in the last 5 years? (amputation, heart surgery, brain surgery)</p>
             </div>
             
             <div className="flex gap-3 md:gap-4 justify-center">
               <button
                 className={`px-6 md:px-8 py-3 md:py-4 rounded-lg font-medium transition-colors text-base md:text-lg ${
                   healthAnswers.q6 === 'yes' 
                     ? 'bg-blue-600 text-white' 
                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                 }`}
                 onClick={() => handleAnswerChange('q6', 'yes')}
               >
                 Yes
               </button>
               <button
                 className={`px-6 md:px-8 py-3 md:py-4 rounded-lg font-medium transition-colors text-base md:text-lg ${
                   healthAnswers.q6 === 'no' 
                     ? 'bg-blue-600 text-white' 
                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                 }`}
                 onClick={() => handleAnswerChange('q6', 'no')}
               >
                 No
               </button>
             </div>
           </div>
         );

       case 8:
         return (
           <div className="space-y-4 md:space-y-6">
             <div className="text-center mb-4 md:mb-6">
               <div className={`inline-block px-3 md:px-4 py-2 rounded-lg mb-2 ${
                 healthTier === 'select1' ? 'bg-green-50 border border-green-200' :
                 healthTier === 'select2' ? 'bg-yellow-50 border border-yellow-200' :
                 'bg-orange-50 border border-orange-200'
               }`}>
                 <h3 className={`text-lg md:text-xl font-bold ${
                   healthTier === 'select1' ? 'text-green-700' :
                   healthTier === 'select2' ? 'text-yellow-700' :
                   'text-orange-700'
                 }`}>Your Health Tier: {healthTier.replace('select', 'Select ')}</h3>
               </div>
               <p className="text-sm md:text-base text-gray-600">Customize your coverage to see your personalized rate</p>
             </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age: {quoteAge}</label>
                  <input
                    type="range"
                    min={60}
                    max={80}
                    value={quoteAge}
                    onChange={(e) => setQuoteAge(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Coverage: ${quoteCoverage.toLocaleString()}</label>
                  <input
                    type="range"
                    min={5000}
                    max={40000}
                    step={1000}
                    value={quoteCoverage}
                    onChange={(e) => setQuoteCoverage(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={quoteGender === 'male'}
                        onChange={() => setQuoteGender('male')}
                        className="mr-2"
                      />
                      Male
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={quoteGender === 'female'}
                        onChange={() => setQuoteGender('female')}
                        className="mr-2"
                      />
                      Female
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center">
                {quote ? (
                  <div className="bg-blue-600 text-white rounded-lg p-4 md:p-8 text-center w-full">
                    <div className="text-2xl md:text-4xl font-bold">${quoteCoverage.toLocaleString()}</div>
                    <div className="text-xs md:text-sm mt-2">Monthly Premium: ${quote}</div>
                    <button
                      className="mt-3 md:mt-4 bg-white text-gray-800 px-4 md:px-6 py-2 rounded-lg font-medium hover:bg-gray-100 flex items-center justify-center gap-2 text-sm md:text-base"
                      onClick={() => setShowSecureModal(true)}
                    >
                      <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span>Secure my quote</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-gray-500 text-center text-sm md:text-base">
                    Complete the form to see your rate
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Get Quote Button */}
      <button
        onClick={() => setShowFunnel(true)}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 md:py-4 px-6 md:px-8 rounded-lg text-lg md:text-xl transition-all duration-1000 w-full md:w-auto"
        style={{
          animation: 'buttonPulse 2s ease-in-out infinite'
        }}
      >
        Get Quote
      </button>

      <style>{`
        @keyframes buttonPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>

      {/* Funnel Modal */}
      {showFunnel && ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 md:p-4">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 md:p-6 rounded-t-xl md:rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">Final Expense Quote</h2>
                  <p className="text-sm md:text-base text-blue-100">Step {currentStep} of {funnelSteps.length}</p>
                </div>
                <button
                  onClick={() => setShowFunnel(false)}
                  className="text-white hover:text-gray-200 text-xl md:text-2xl p-1"
                >
                  ×
                </button>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4 bg-blue-500 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-300"
                  style={{ width: `${(currentStep / funnelSteps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="p-4 md:p-6">
              {renderStepContent()}
            </div>

            {/* Navigation */}
            <div className="p-4 md:p-6 border-t border-gray-200 flex justify-between">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  currentStep === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Back
              </button>
              
              {currentStep !== funnelSteps.length && (
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    canProceed()
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Secure Quote Modal */}
      {showSecureModal && ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-blue-700 mb-4">Secure Your Quote</h3>
              
              <div className="space-y-4">
                <p className="text-gray-600">Ready to secure your rate? Choose how you'd like to proceed:</p>
                
                {/* Call Option */}
                <a
                  href="tel:5037645097"
                  className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>Call Now: (503) 764-5097</span>
                  </div>
                </a>
                
                {/* Or divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or</span>
                  </div>
                </div>
                
                {/* Schedule Call Option */}
                <a
                  href="https://calendly.com/mikealfieri/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Schedule a Call</span>
                  </div>
                </a>
                
                {/* Close button */}
                <button
                  onClick={() => setShowSecureModal(false)}
                  className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default QuoteFunnel; 