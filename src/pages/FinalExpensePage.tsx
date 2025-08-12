import React, { useState } from "react";
import ReactDOM from "react-dom";
import { funeralCostsByState } from "./funeralCostsByState";
import { getNationalQuote, getCashValueTable } from "./csvQuoteUtils";

const sellingPoints = [
  "No medical exam required – easy approval",
  "Flexible coverage amounts to fit your needs",
  "Protects your family from financial burden"
];

const states = funeralCostsByState.map(f => f.state).sort();

const FinalExpensePage: React.FC = () => {
  // Simple form state (expand as needed)
  const [form, setForm] = useState({ name: "", age: "", state: "", coverage: "", health: "", email: "" });
  const [selectedState, setSelectedState] = useState("");
  const [burialType, setBurialType] = useState("");

  // Add state for quote slider section
  const [quoteGender, setQuoteGender] = useState<'male' | 'female'>('male');
  const [quoteAge, setQuoteAge] = useState(50);
  const [quoteCoverage, setQuoteCoverage] = useState(5000);

  // Add state for health tier (default: select1)
  const [healthTier, setHealthTier] = useState<'select1' | 'select2' | 'select3'>('select1');

  // Health questionnaire state
  const [q1, setQ1] = useState<string | null>(null);
  const [q2, setQ2] = useState<string | null>(null);
  const [q3, setQ3] = useState<string | null>(null);
  const [q4, setQ4] = useState<string | null>(null);
  const [q5, setQ5] = useState<string | null>(null);

  // Auto-classify health tier based on answers
  React.useEffect(() => {
    if (!selectedState || !burialType) return;
    // If all questions are answered 'yes', set to select3
    if ([q1, q2, q3, q4, q5].every(q => q === "yes")) {
      setHealthTier("select3");
    } 
    // If 3 or more questions are answered 'yes', set to select2
    else if ([q1, q2, q3, q4, q5].filter(q => q === "yes").length >= 3) {
      setHealthTier("select2");
    } 
    // If all are 'no', set to select1
    else if ([q1, q2, q3, q4, q5].every(q => q === "no")) {
      setHealthTier("select1");
    }
    // Otherwise, keep default (select1)
  }, [q1, q2, q3, q4, q5, selectedState, burialType]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle state and burial/cremation selection
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedState(e.target.value);
    setForm({ ...form, state: e.target.value });
  };
  const handleBurialTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBurialType(e.target.value);
  };

  // Handle form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(false);
    setSubmitSuccess(false);

    try {
      const response = await fetch('https://fexshop.onrender.com/api/send-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          age: form.age,
          state: form.state,
          coverage: form.coverage,
          health: form.health,
          email: form.email,
          burialType,
          healthTier,
          healthAnswers: {
            q1, q2, q3, q4, q5
          }
        }),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        // Reset form
        setForm({ name: "", age: "", state: "", coverage: "", health: "", email: "" });
        setSelectedState("");
        setBurialType("");
        setHealthTier('select1');
        setQ1(null);
        setQ2(null);
        setQ3(null);
        setQ4(null);
        setQ5(null);
      } else {
        setSubmitError(true);
      }
    } catch (error) {
      setSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get average cost for selected state and type
  const costData = funeralCostsByState.find(f => f.state === selectedState);
  let costRange: string | undefined = undefined;
  if (costData && burialType) {
    const [min, max] = burialType === "burial" ? costData.burial : costData.cremation;
    costRange = `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  }

  let costBoxText = "Select your state and burial or cremation to see the average cost.";
  if (costRange) {
    costBoxText = `Average ${burialType.charAt(0).toUpperCase() + burialType.slice(1)} Cost in ${selectedState}: ${costRange}`;
  }

  // Get quote for Michigan only (demo)
  const quote = selectedState
    ? getNationalQuote(quoteGender, quoteAge, quoteCoverage, healthTier)
    : null;

  // Get cash value table for selected tier
  const cashValueTable = getCashValueTable(healthTier);

  // Modal state
  const [showSecureModal, setShowSecureModal] = useState(false);
  const [secureForm, setSecureForm] = useState({ name: "", contact: "", account: "", routing: "", agree: false });
  const [secureSubmitted, setSecureSubmitted] = useState(false);

  const handleSecureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSecureForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };
  const handleSecureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSecureSubmitted(true);
    // TODO: Integrate payment/ACH processing here
  };

  // Refund policy modal state
  const [showRefundModal, setShowRefundModal] = useState(false);

  // Add state for quote sharing modal
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [sharePhone, setSharePhone] = useState("");
  const [shareSuccess, setShareSuccess] = useState(false);

  // Add state for sending
  const [isSendingQuote, setIsSendingQuote] = useState(false);

  // Add state for the secure quote popup
  const [showSecureQuoteModal, setShowSecureQuoteModal] = useState(false);

  // Handle secure quote button click
  const handleSecureQuoteClick = () => {
    setShowSecureQuoteModal(true);
  };

  return (
    <section className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-300 relative overflow-x-hidden py-12 px-2">
      {/* Subtle background shapes */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <svg width="100%" height="100%" className="absolute top-0 left-0 opacity-10" style={{zIndex:0}}>
          <circle cx="80%" cy="20%" r="180" fill="#3b82f6" />
          <circle cx="20%" cy="80%" r="120" fill="#60a5fa" />
        </svg>
      </div>
      {/* Page Header - now above the card */}
      <div className="w-full flex flex-col items-center justify-center mb-8 mt-2">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 bg-clip-text text-transparent drop-shadow-lg text-center">Final Expense Plans</h1>
        <p className="text-lg md:text-xl text-gray-700 font-medium text-center max-w-2xl">Instant Quote. No SSN required. No spam calls.</p>
      </div>
      <div className="w-full max-w-4xl mx-auto mt-2 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-6">
        {/* Step 1 */}
        <div className="relative flex flex-col items-center flex-1 transition-transform duration-200 hover:-translate-y-2 hover:shadow-2xl cursor-pointer group will-change-transform rounded-2xl m-1 p-5">
          <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl bg-white/80 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col items-center w-full">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-700 to-blue-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-2">1</div>
            <div className="text-lg font-semibold text-blue-900">Get Your Quote</div>
            <div className="text-sm text-gray-500 text-center mt-1">Input your info and see your rate instantly.</div>
          </div>
        </div>
        <div className="hidden md:block text-3xl text-blue-300 mx-2">→</div>
        {/* Step 2 */}
        <div className="relative flex flex-col items-center flex-1 transition-transform duration-200 hover:-translate-y-2 hover:shadow-2xl cursor-pointer group will-change-transform rounded-2xl m-1 p-5">
          <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl bg-white/80 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col items-center w-full">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-700 to-teal-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-2">2</div>
            <div className="text-lg font-semibold text-blue-900">Connect with Agent</div>
            <div className="text-sm text-gray-500 text-center mt-1">Lock in your rate with a licensed expert.</div>
          </div>
        </div>
        <div className="hidden md:block text-3xl text-blue-300 mx-2">→</div>
        {/* Step 3 */}
        <div className="relative flex flex-col items-center flex-1 transition-transform duration-200 hover:-translate-y-2 hover:shadow-2xl cursor-pointer group will-change-transform rounded-2xl m-1 p-5">
          <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl bg-white/80 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col items-center w-full">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-700 to-indigo-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-2">3</div>
            <div className="text-lg font-semibold text-blue-900">Peace of Mind</div>
            <div className="text-sm text-gray-500 text-center mt-1">Rest easy knowing your family is protected.</div>
          </div>
        </div>
      </div>
      {/* Main Card - much wider, now floats below header */}
      <div className="relative z-10 w-full max-w-6xl rounded-3xl shadow-2xl bg-white/80 backdrop-blur-lg border border-blue-100 p-4 sm:p-6 md:p-12 flex flex-col items-center">
        {/* State and Burial/Cremation Selection Row */}
        <form className="w-full flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-4 w-full justify-center items-center">
            <div className="relative w-full md:w-1/2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none z-10 flex items-center" style={{height: '100%'}}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M12 6v6l4 2"/></svg>
              </span>
              <select
                className="pl-16 pr-4 py-4 rounded-xl border border-blue-200 w-full bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-lg sm:text-xl shadow-sm appearance-none"
                value={selectedState}
                onChange={handleStateChange}
                required
              >
                <option value="">Select Your State</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            <div className="relative w-full md:w-1/2 mt-4 md:mt-0">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none z-10 flex items-center" style={{height: '100%'}}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/></svg>
              </span>
              <select
                className="pl-16 pr-4 py-4 rounded-xl border border-blue-200 w-full bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-lg sm:text-xl shadow-sm appearance-none"
                value={burialType}
                onChange={handleBurialTypeChange}
                required
              >
                <option value="">Burial or Cremation?</option>
                <option value="burial">Burial</option>
                <option value="cremation">Cremation</option>
              </select>
            </div>
          </div>
          <div className={`rounded-xl px-4 sm:px-6 py-3 sm:py-4 font-semibold shadow text-center w-full mt-2 transition-colors duration-300 ${selectedState && burialType ? 'bg-red-100 text-red-900' : 'bg-green-100 text-green-900'}`}>
            <span>
              {costBoxText}
              {costRange && <sup className="ml-1 text-xs align-super">*</sup>}
            </span>
          </div>
          {/* Data source footnote */}
          <div className="w-full flex justify-end mt-0 mb-0" style={{marginTop: 0, marginBottom: 0}}>
            <span className="text-xs text-gray-500 italic">
              * Source: National Funeral Directors Association, 2024. Ranges are approximate and may vary by provider.
            </span>
          </div>
          {/* Callout above questionnaire */}
          {selectedState && burialType && (
            <div className="w-full flex justify-center my-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 shadow-lg rounded-2xl px-8 py-6 flex items-start gap-4 max-w-2xl mx-auto transition-transform duration-200 hover:scale-105 hover:shadow-2xl cursor-pointer">
                <div className="flex-shrink-0 mt-1">
                  {/* Shield with checkmark icon (same as header) */}
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="shieldGradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#2563eb" />
                        <stop offset="1" stopColor="#60a5fa" />
                      </linearGradient>
                    </defs>
                    <path d="M16 4L27 8V15C27 23 16 28 16 28C16 28 5 23 5 15V8L16 4Z" fill="url(#shieldGradient)" stroke="#1e40af" strokeWidth="2"/>
                    <path d="M12 16.5L15 19.5L20 13.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-blue-700 text-lg mb-1">Don't worry!</div>
                  <div className="text-blue-800 font-medium">
                    Millions of families are protecting their loved ones from financial burden with a Final Expense plan.
                    <div className="mt-2 font-semibold">Just answer a few questions to get started!</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Health Questionnaire */}
          {selectedState && burialType && (
            <>
              <div className="w-full bg-white/90 rounded-2xl shadow-lg p-2 sm:p-4 flex flex-col gap-2 border border-blue-100 mt-2">
                <h2 className="text-2xl font-extrabold text-blue-700 flex items-center gap-2">
                  <span role="img" aria-label="stethoscope">🩺</span> Quick Health Questionnaire
                </h2>
                <p className="text-gray-700 mt-0">  Answer these questions to help us find the best plan for you. Your answers are private and only used to match you to the right coverage.</p>
                <div className="space-y-2">
                  {/* Q1 (tobacco) */}
                  <div className="p-3 sm:p-5 rounded-xl bg-blue-50 shadow flex flex-col gap-2">
                    <div className="font-bold text-lg text-blue-800 text-center w-full">
                      1. Have you used tobacco in the past 12 months?
                    </div>
                    <div className="flex flex-row flex-wrap gap-3 mt-2 justify-center items-center w-full">
                      <label className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg transition border-2 ${q5 === 'yes' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-blue-200 hover:bg-blue-100'}`}>
                        <input type="radio" name="q5" value="yes" checked={q5 === "yes"} onChange={() => setQ5("yes")} className="accent-blue-600 w-5 h-5" />
                        Yes
                      </label>
                      <label className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg transition border-2 ${q5 === 'no' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-blue-200 hover:bg-blue-100'}`}>
                        <input type="radio" name="q5" value="no" checked={q5 === "no"} onChange={() => setQ5("no")} className="accent-blue-600 w-5 h-5" />
                        No
                      </label>
                    </div>
                  </div>
                  {/* Q2 (oxygen/wheelchair/nursing home) */}
                  <div className="p-3 sm:p-5 rounded-xl bg-blue-50 shadow flex flex-col gap-2">
                    <div className="font-bold text-lg text-blue-800 text-center w-full">
                      2. Do you currently use oxygen, a wheelchair, or reside in a nursing home?
                    </div>
                    <div className="flex flex-row flex-wrap gap-3 mt-2 justify-center items-center w-full">
                      <label className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg transition border-2 ${q3 === 'yes' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-blue-200 hover:bg-blue-100'}`}>
                        <input type="radio" name="q3" value="yes" checked={q3 === "yes"} onChange={() => setQ3("yes")} className="accent-blue-600 w-5 h-5" />
                        Yes
                      </label>
                      <label className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg transition border-2 ${q3 === 'no' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-blue-200 hover:bg-blue-100'}`}>
                        <input type="radio" name="q3" value="no" checked={q3 === "no"} onChange={() => setQ3("no")} className="accent-blue-600 w-5 h-5" />
                        No
                      </label>
                    </div>
                  </div>
                  {/* Q3 (hospitalized overnight) */}
                  <div className="p-3 sm:p-5 rounded-xl bg-blue-50 shadow flex flex-col gap-2">
                    <div className="font-bold text-lg text-blue-800 text-center w-full">
                      3. In the past 2 years, have you been hospitalized overnight for any reason?
                    </div>
                    <div className="flex flex-row flex-wrap gap-3 mt-2 justify-center items-center w-full">
                      <label className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg transition border-2 ${q2 === 'yes' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-blue-200 hover:bg-blue-100'}`}>
                        <input type="radio" name="q2" value="yes" checked={q2 === "yes"} onChange={() => setQ2("yes")} className="accent-blue-600 w-5 h-5" />
                        Yes
                      </label>
                      <label className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg transition border-2 ${q2 === 'no' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-blue-200 hover:bg-blue-100'}`}>
                        <input type="radio" name="q2" value="no" checked={q2 === "no"} onChange={() => setQ2("no")} className="accent-blue-600 w-5 h-5" />
                        No
                      </label>
                    </div>
                  </div>
                  {/* Q4 (well controlled conditions) */}
                  <div className="p-3 sm:p-5 rounded-xl bg-blue-50 shadow flex flex-col gap-2">
                    <div className="font-bold text-lg text-blue-800 text-center w-full">
                      4. Do you have any of the following conditions, but they are well controlled (e.g., with medication): high blood pressure, high cholesterol, type 2 diabetes (non-insulin)?
                    </div>
                    <div className="flex flex-row flex-wrap gap-3 mt-2 justify-center items-center w-full">
                      <label className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg transition border-2 ${q4 === 'yes' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-blue-200 hover:bg-blue-100'}`}>
                        <input type="radio" name="q4" value="yes" checked={q4 === "yes"} onChange={() => setQ4("yes")} className="accent-blue-600 w-5 h-5" />
                        Yes
                      </label>
                      <label className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg transition border-2 ${q4 === 'no' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-blue-200 hover:bg-blue-100'}`}>
                        <input type="radio" name="q4" value="no" checked={q4 === "no"} onChange={() => setQ4("no")} className="accent-blue-600 w-5 h-5" />
                        No
                      </label>
                    </div>
                  </div>
                  {/* Q5 (diagnosed/treated for serious conditions) */}
                  <div className="p-3 sm:p-5 rounded-xl bg-blue-50 shadow flex flex-col gap-2">
                    <div className="font-bold text-lg text-blue-800 text-center w-full">
                      5. In the past 2 years, have you been diagnosed with, treated for, or advised to have treatment for any of the following: cancer (other than basal cell skin cancer), heart attack, stroke, congestive heart failure, COPD/emphysema, kidney failure, HIV/AIDS?
                    </div>
                    <div className="flex flex-row flex-wrap gap-3 mt-2 justify-center items-center w-full">
                      <label className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg transition border-2 ${q1 === 'yes' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-blue-200 hover:bg-blue-100'}`}>
                        <input type="radio" name="q1" value="yes" checked={q1 === "yes"} onChange={() => setQ1("yes")} className="accent-blue-600 w-5 h-5" />
                        Yes
                      </label>
                      <label className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg transition border-2 ${q1 === 'no' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-blue-200 hover:bg-blue-100'}`}>
                        <input type="radio" name="q1" value="no" checked={q1 === "no"} onChange={() => setQ1("no")} className="accent-blue-600 w-5 h-5" />
                        No
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              {/* Health Tier Result Box */}
              <div className="w-full flex justify-center my-4">
                <div className={`flex flex-col justify-center items-center px-8 py-5 rounded-2xl shadow-xl border text-xl font-medium transition-transform duration-200 bg-opacity-90 will-change-transform
                  ${healthTier === 'select1' ? 'bg-blue-50 text-blue-700 border-blue-200' : healthTier === 'select2' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}
                  hover:scale-101 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_0_rgba(34,197,94,0.10)]
                `} style={{boxShadow: '0 4px 16px 0 rgba(34, 197, 94, 0.07), 0 1.5px 8px 0 rgba(0,0,0,0.06)'}}> 
                  <span className="flex items-center justify-center w-full">Your Health Tier: <span className="font-extrabold text-2xl ml-2">{healthTier.replace('select', 'Select ')}</span></span>
                </div>
              </div>
              <div className="w-full flex justify-center mb-4">
                <span className="text-xs text-gray-500 italic text-center max-w-xl block">
                  In some cases, expert advice from an agent can help you navigate the health classifications in order to find you a better rate. Call if you think this applies to you.
                </span>
              </div>
              {/* --- SLIDER SECTION: Sleek horizontal layout --- */} 
              <div className="w-full bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-8 border border-blue-100 mt-8">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
                  {/* Left side - Input controls */}
                  <div className="flex-1 space-y-4 sm:space-y-6">
                    {/* Age and Coverage in a row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="font-semibold text-blue-700 text-base sm:text-lg">Age:</label>
                          <span className="font-bold text-xl sm:text-2xl text-blue-900">{quoteAge}</span>
                        </div>
                        <input
                          id="age-slider"
                          type="range"
                          min={60}
                          max={80}
                          value={quoteAge}
                          onChange={e => setQuoteAge(Number(e.target.value))}
                          className="w-full accent-blue-700"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="font-semibold text-blue-700 text-base sm:text-lg">Coverage:</label>
                          <span className="font-bold text-xl sm:text-2xl text-blue-900">${quoteCoverage.toLocaleString()}</span>
                        </div>
                        <input
                          id="coverage-slider"
                          type="range"
                          min={5000}
                          max={40000}
                          step={1000}
                          value={quoteCoverage}
                          onChange={e => setQuoteCoverage(Number(e.target.value))}
                          className="w-full accent-blue-700"
                        />
                      </div>
                    </div>

                    {/* Gender and Health Tier in a row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2 sm:space-y-3">
                        <label className="font-semibold text-blue-700 text-base sm:text-lg block">Gender:</label>
                        <div className="flex flex-wrap gap-3 sm:gap-4">
                          <label className="inline-flex items-center gap-2 cursor-pointer text-sm sm:text-base">
                            <input 
                              type="radio" 
                              name="gender" 
                              value="male" 
                              checked={quoteGender === 'male'} 
                              onChange={() => setQuoteGender('male')} 
                              className="accent-blue-700" 
                            />
                            Male
                          </label>
                          <label className="inline-flex items-center gap-2 cursor-pointer text-sm sm:text-base">
                            <input 
                              type="radio" 
                              name="gender" 
                              value="female" 
                              checked={quoteGender === 'female'} 
                              onChange={() => setQuoteGender('female')} 
                              className="accent-blue-700" 
                            />
                            Female
                          </label>
                        </div>
                      </div>
                      
                      <div className="space-y-2 sm:space-y-3">
                        <label className="font-semibold text-blue-700 text-base sm:text-lg block">Health Tier:</label>
                        <div className="flex flex-wrap gap-2 sm:gap-4">
                          <label className="inline-flex items-center gap-1 text-sm sm:text-base">
                            <input type="radio" name="tier" value="select1" checked={healthTier === 'select1'} onChange={() => setHealthTier('select1')} className="accent-blue-700" />
                            Select 1
                          </label>
                          <label className="inline-flex items-center gap-1 text-sm sm:text-base">
                            <input type="radio" name="tier" value="select2" checked={healthTier === 'select2'} onChange={() => setHealthTier('select2')} className="accent-green-600" />
                            Select 2
                          </label>
                          <label className="inline-flex items-center gap-1 text-sm sm:text-base">
                            <input type="radio" name="tier" value="select3" checked={healthTier === 'select3'} onChange={() => setHealthTier('select3')} className="accent-yellow-600" />
                            Select 3
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right side - Quote display */}
                  <div className="flex flex-col items-center justify-center w-full lg:w-80 lg:flex-shrink-0">
                    <div
                      className="bg-blue-600 text-white rounded-2xl px-6 sm:px-8 py-8 sm:py-10 shadow-xl text-center w-full transition-transform duration-150 hover:scale-105 cursor-pointer"
                      onClick={handleSecureQuoteClick}
                      role="button"
                      tabIndex={0}
                      style={{ outline: 'none' }}
                    >
                      {selectedState && burialType && quote ? (
                        <>
                          <div className="flex items-baseline justify-center gap-2 w-full">
                            <span className="text-3xl sm:text-4xl font-bold">${quote}</span>
                            <span className="text-base sm:text-lg font-medium">/month</span>
                          </div>
                          <span className="text-xs sm:text-sm text-white font-medium mt-2 sm:mt-3 block">Click to Secure</span>
                        </>
                      ) : (
                        <span className="text-lg sm:text-xl font-semibold text-blue-100">Input info above to get your rate!</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 mt-3 text-center px-2">* Final rates may vary based on official medical underwriting.</span>
                    
                    {/* Share Quote Button */}
                    {selectedState && burialType && quote && (
                      <button
                        type="button"
                        className="mt-4 sm:mt-6 bg-blue-50 border border-gray-200 text-gray-800 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base shadow-sm hover:bg-blue-100 transition w-full"
                        onClick={() => setShowShareModal(true)}
                      >
                        Send me my quote!
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
          {/* Form Notifications */}
          {submitSuccess && (
            <div className="w-full bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-green-700 font-medium">Thank you! We'll be in touch with your personalized quote soon.</p>
              </div>
            </div>
          )}
          {submitError && (
            <div className="w-full bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 font-medium">Sorry, there was an error submitting your form. Please try again.</p>
              </div>
            </div>
          )}
        </form>
      </div>
      {showShareModal && ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-2 sm:px-0">
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 max-w-md w-full relative flex flex-col gap-6">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-blue-700 text-2xl" onClick={() => { setShowShareModal(false); setShareSuccess(false); setShareEmail(""); setSharePhone(""); }}>&times;</button>
            {!shareSuccess ? (
              <>
                <h2 className="text-xl sm:text-2xl font-extrabold text-blue-700 mb-2">Send Your Quote</h2>
                <p className="text-gray-700 mb-2 text-sm sm:text-base">Enter your email to receive your personalized quote.</p>
                <form
                  className="flex flex-col gap-4"
                  onSubmit={async e => {
                    e.preventDefault();
                    if (isSendingQuote) return;
                    setIsSendingQuote(true);
                    try {
                      const response = await fetch('https://fexshop.onrender.com/api/send-quote', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          email: shareEmail,
                          quote,
                          state: selectedState,
                          burialType,
                          gender: quoteGender,
                          age: quoteAge,
                          coverage: quoteCoverage,
                          healthTier,
                          name: form.name,
                        }),
                      });
                      if (response.ok) {
                        setShareSuccess(true);
                      } else {
                        alert('Failed to send quote. Please try again.');
                      }
                    } catch (error) {
                      alert('Failed to send quote. Please try again.');
                    } finally {
                      setIsSendingQuote(false);
                    }
                  }}
                >
                  <input
                    className="p-3 rounded border border-blue-200 focus:ring-2 focus:ring-blue-400"
                    type="email"
                    placeholder="Email"
                    value={shareEmail}
                    onChange={e => setShareEmail(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-blue-700 text-white py-2 sm:py-3 rounded-lg font-bold text-base sm:text-lg hover:bg-blue-800 transition mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={isSendingQuote}
                  >
                    {isSendingQuote ? 'Sending...' : 'Send My Quote'}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-700">Quote Sent!</h2>
                <p className="text-gray-700 text-center text-sm sm:text-base">Check your email for your personalized quote.</p>
                <div className="text-center">
                  <span className="block text-base font-bold text-black">(Check your Spam Folder)</span>
                </div>
                <p className="text-gray-700 text-center text-sm sm:text-base">Contact an agent to secure your rate!</p>
                <button className="mt-2 px-4 sm:px-6 py-2 rounded-lg bg-blue-700 text-white font-bold hover:bg-blue-800 text-base sm:text-lg" onClick={() => { setShowShareModal(false); setShareSuccess(false); setShareEmail(""); setSharePhone(""); }}>Close</button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
      {/* Secure Quote Modal */}
      {showSecureQuoteModal && ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-2 sm:px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm sm:max-w-lg w-full mx-2 sm:mx-4 relative max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <h2 className="text-lg sm:text-xl font-bold">Thank You for Your Interest!</h2>
                </div>
                <button 
                  className="text-white hover:text-gray-200 transition-colors duration-200 p-1" 
                  onClick={() => setShowSecureQuoteModal(false)}
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-4 sm:px-6 py-4 sm:py-6">
              <div className="text-gray-900 font-bold text-base sm:text-lg text-center mb-4 sm:mb-6">
                Final step:
              </div>

              {/* Option 1: Call Directly */}
              <a
                href="tel:5037645097"
                className="block w-full bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 px-3 sm:px-4 rounded-xl mb-3 transition-colors duration-200 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                </svg>
                <span className="text-center">
                  <div className="font-semibold">Call Directly:</div>
                  <div className="font-bold">1-800-Final-Expenses</div>
                </span>
              </a>

              {/* "or" divider */}
              <div className="text-center mb-3">
                <span className="text-gray-500 font-medium text-sm">or</span>
              </div>

              {/* Option 2: Book Consultation */}
              <a
                href="https://calendly.com/mikealfieri/30min?back=1&month=2025-08"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-3 sm:px-4 rounded-xl mb-4 sm:mb-6 transition-colors duration-200 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                </svg>
                <span className="text-center">
                  <div className="font-semibold">Book Consultation Now</div>
                </span>
              </a>

              {/* Close Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => setShowSecureQuoteModal(false)}
                  className="w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-3 sm:px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
};

export default FinalExpensePage; 