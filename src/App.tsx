// @ts-ignore: PNG import for Vite
import headshot from './assets/headshot2.png'
// @ts-ignore: PNG import for Vite
import partners from './assets/partners.png'
import React, { useEffect, useState } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { Link, Routes, Route, useLocation } from 'react-router-dom'
// import ChatbaseWidget from './ChatbaseWidget'
import QuoteFunnel from './pages/QuoteFunnel'

// SMS Opt-in Form Component
function SMSOptInForm() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !consent) {
      setMessage('Please enter your phone number and check the consent box.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      // Format phone number
      const formattedPhone = phoneNumber.replace(/\D/g, '');
      const fullPhone = formattedPhone.startsWith('1') ? `+${formattedPhone}` : `+1${formattedPhone}`;

      // Send to your SMS server
      const response = await fetch('http://localhost:3001/start-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: fullPhone,
          source: 'landing_page_optin'
        }),
      });

      if (response.ok) {
        setMessage('✅ Great! Check your phone for your personalized quote!');
        setPhoneNumber('');
        setConsent(false);
      } else {
        setMessage('❌ Something went wrong. Please try again.');
      }
    } catch (error) {
      setMessage('❌ Connection error. Please try again.');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Your Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="(555) 123-4567"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="consent"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            required
          />
          <label htmlFor="consent" className="text-sm text-gray-700">
            I consent to receive SMS messages about final expense insurance quotes. 
            Message & data rates may apply. Reply STOP to unsubscribe. 
            <a href="/privacy" className="text-blue-600 hover:underline ml-1">Privacy Policy</a>
          </label>
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Sending...' : 'Get My SMS Quote Now'}
        </button>
      </form>

      <p className="text-xs text-gray-500 mt-3 text-center">
        No spam • No medical exam • Instant quotes
      </p>
    </div>
  );
}

// Page components
function CenteredNotification({ show, message, onClose }: { show: boolean, message: string, onClose: () => void }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-2xl px-8 py-6 text-center">
        <div className="text-2xl font-bold text-blue-700 mb-2">{message}</div>
        <button
          className="mt-2 px-6 py-2 bg-blue-700 text-white rounded-full font-semibold hover:bg-blue-800 transition"
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>
  );
}

function HomePage() {
  return (
    <section className="min-h-screen w-full flex flex-col items-start justify-start bg-gradient-to-br from-blue-100 via-white to-blue-300 relative overflow-x-hidden pt-16 px-2">
      {/* Subtle background shapes */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <svg width="100%" height="100%" className="absolute top-0 left-0 opacity-10" style={{zIndex:0}}>
          <circle cx="80%" cy="20%" r="180" fill="#3b82f6" />
          <circle cx="20%" cy="80%" r="120" fill="#60a5fa" />
        </svg>
      </div>
      
      {/* Page Header */}
      <div className="w-full flex flex-col items-center justify-center mb-2 mt-4 px-4">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-2 md:mb-3 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 bg-clip-text text-transparent drop-shadow-lg text-center mt-0">Final Expense Protection</h1>
        <p className="text-base md:text-lg lg:text-xl text-gray-700 font-medium text-center max-w-2xl px-2">Protect your family from financial burden. Get your personalized quote in minutes.</p>
      </div>

      {/* Main CTA Section */}
      <div className="w-full max-w-4xl mx-auto mt-1 mb-8 px-4">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl md:rounded-3xl shadow-2xl border border-blue-100 p-4 md:p-8 lg:p-12 text-center">
          <div className="mb-4 md:mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-4 md:mt-8">
              <div className="flex flex-col items-center p-4 md:p-6 bg-blue-50 rounded-xl">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-600 rounded-full flex items-center justify-center mb-3 md:mb-4">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-blue-700 mb-1 md:mb-2 text-center">No Medical Exam</h3>
              </div>
              
              <div className="flex flex-col items-center p-4 md:p-6 bg-blue-50 rounded-xl">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-600 rounded-full flex items-center justify-center mb-3 md:mb-4">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4z" />
                    <path fill="white" d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4z" style={{clipPath: 'inset(0 50% 0 0)'}} />
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-blue-700 mb-1 md:mb-2 text-center">No SSN Required</h3>
              </div>
              
              <div className="flex flex-col items-center p-4 md:p-6 bg-blue-50 rounded-xl">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-600 rounded-full flex items-center justify-center mb-3 md:mb-4">
                  <svg className="w-7 h-7 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-blue-700 mb-1 md:mb-2 text-center">Tax Free Check</h3>
              </div>
            </div>
          </div>
          
          {/* SMS Opt-in Form */}
          <div className="mt-6 md:mt-8 mb-6 md:mb-8">
            <h3 className="text-xl md:text-2xl font-bold text-blue-700 mb-4 text-center">
              Get Your Quote via SMS
            </h3>
            <p className="text-gray-600 mb-6 text-center">
              Answer a few quick questions and get your personalized final expense quote sent directly to your phone
            </p>
            <SMSOptInForm />
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">OR</span>
            </div>
          </div>

          {/* Original CTA Button */}
          <div className="mt-4 md:mt-8">
            <QuoteFunnel />
          </div>
          
          <p className="text-xs md:text-sm text-gray-500 mt-3 md:mt-4 px-2">No SSN required • No spam calls • Instant quotes</p>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="w-full max-w-4xl mx-auto mt-6 md:mt-8 px-4">
        <div className="bg-white/80 backdrop-blur-lg rounded-xl md:rounded-2xl shadow-lg border border-blue-100 p-4 md:p-6 text-center">
          <h3 className="text-lg md:text-xl font-bold text-blue-700 mb-3 md:mb-4">Trusted by Thousands</h3>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-700 font-medium">Licensed & Insured</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-700 font-medium">A+ Rated Carriers</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-700 font-medium">24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SchedulePage() {
  useEffect(() => {
    // Load Calendly script
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script on component unmount
      document.body.removeChild(script);
    };
  }, []);

  return (
    <section className="py-8 min-h-[60vh] flex flex-col justify-start bg-gradient-to-l from-blue-100/70 via-white/80 to-blue-200/60" data-aos="fade-up">
      <div className="w-full px-0 text-center">
        <h2 className="text-3xl font-extrabold mb-0 text-blue-700">Contact an Agent</h2>
        <p className="text-lg text-gray-700 mb-0">Contact an agent to discuss your needs.</p>
        <div 
          className="calendly-inline-widget mx-auto" 
          data-url="https://calendly.com/mikealfieri/30min"
          style={{ width: '100vw', minWidth: '320px', height: '700px' }}
        />
      </div>
    </section>
  );
}

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/schedule', label: 'Contact an Agent' },
];

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const activePath = location.pathname;

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  return (
    <>
      {/* <ChatbaseWidget /> */}
      <div className="min-h-screen bg-gray-50 font-sans">
        {/* Mobile Phone Number Banner */}
        <a
          href="tel:5037645097"
          className="flex md:hidden justify-center items-center font-semibold text-blue-700 bg-blue-50 py-2 w-full shadow-sm text-lg tracking-wide border-b border-blue-100"
          style={{ textDecoration: 'none' }}
        >
          <svg className="w-5 h-5 mr-2 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 01-2.18 2A19.72 19.72 0 013 5.18 2 2 0 015 3h3a2 2 0 012 1.72c.13 1.05.37 2.06.72 3a2 2 0 01-.45 2.11l-1.27 1.27a16 16 0 006.29 6.29l1.27-1.27a2 2 0 012.11-.45c.94.35 1.95.59 3 .72A2 2 0 0122 16.92z" />
          </svg>
          (503) 764-5097
        </a>
        {/* Navigation */}
        <nav className="bg-white shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6">
            <div className="flex flex-col w-full">
              {/* Main Nav Row */}
              <div className="flex justify-between h-14 items-center w-full px-0 sm:px-2">
                <Link to="/" className="text-2xl font-extrabold text-blue-700 tracking-tight hover:text-blue-900 transition flex items-center gap-2" style={{ textDecoration: 'none' }}>
                  FEX Pro
                  {/* Sleek insurance logo: shield with checkmark */}
                  <span className="ml-2">
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
                  </span>
                </Link>
                {/* Desktop Nav */}
                <div className="hidden md:flex items-center">
                  {NAV_LINKS.map((link, idx) => (
                    <React.Fragment key={link.to}>
                      {idx !== 0 && (
                        <span className="mx-3 text-gray-300 text-lg select-none">|</span>
                      )}
                      <Link
                        to={link.to}
                        className={`font-medium transition px-2 py-1 rounded relative
                          ${activePath === link.to ? 'text-blue-700 bg-blue-100 shadow-md' : 'text-gray-700 hover:text-blue-700 hover:bg-blue-100 hover:shadow-md'}
                          duration-200 ease-in-out
                        `}
                        style={{ display: 'inline-block' }}
                      >
                        {link.label}
                      </Link>
                    </React.Fragment>
                  ))}
                  <a
                    href="tel:5037645097"
                    className="hidden md:inline-block font-semibold text-blue-700 bg-blue-50 px-5 py-2 rounded-full shadow hover:bg-blue-100 transition ml-6 text-lg tracking-wide"
                    style={{ textDecoration: 'none' }}
                  >
                    (503) 764-5097
                  </a>
                </div>
                {/* Mobile Hamburger */}
                <button
                  className="md:hidden flex items-center justify-center w-10 h-10 rounded hover:bg-gray-100 focus:outline-none"
                  onClick={() => setIsMenuOpen(v => !v)}
                  aria-label="Open menu"
                >
                  <svg className="w-7 h-7 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-white shadow-lg px-6 py-4 flex flex-col space-y-4">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block font-medium transition px-2 py-2 rounded relative
                    ${activePath === link.to ? 'text-blue-700 bg-blue-100 shadow-md' : 'text-gray-700 hover:text-blue-700 hover:bg-blue-100 hover:shadow-md'}
                    duration-200 ease-in-out
                  `}
                  onClick={() => setIsMenuOpen(false)}
                  style={{ display: 'inline-block' }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </nav>
        {/* Page Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/final-expense" element={<QuoteFunnel />} />
        </Routes>
        {/* Professional Footer */}
        <footer className="bg-black text-gray-200 border-t border-gray-800 pt-8 sm:pt-12 pb-6 sm:pb-8 mt-0">
          <div className="max-w-7xl mx-auto px-2 sm:px-6 flex flex-col md:flex-row justify-between items-center md:items-start gap-8 sm:gap-12 md:gap-0">
            {/* Brand & Tagline */}
            <div className="flex-1 text-center md:text-left mb-6 sm:mb-8 md:mb-0">
              <div className="flex items-center justify-center md:justify-start gap-2 sm:gap-3 mb-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-blue-400 tracking-tight">FEX Pro</span>
                <span className="inline-block bg-blue-700 text-white text-xs px-2 sm:px-3 py-1 rounded-full font-semibold ml-2">Licensed & Insured</span>
              </div>
              <div className="text-base sm:text-lg text-gray-400 font-medium">Your trusted protection partner</div>
            </div>
            {/* Contact Info */}
            <div className="flex-1 text-center md:text-left mb-6 sm:mb-8 md:mb-0">
              <h4 className="text-lg sm:text-xl font-bold text-white mb-2">Contact Info</h4>
              <div className="text-gray-300 text-sm sm:text-base font-medium">Email: <a href="mailto:michaelalfieri.ffl@gmail.com" className="hover:text-blue-400 transition">michaelalfieri.ffl@gmail.com</a></div>
              <div className="text-gray-300 text-sm sm:text-base font-medium">Phone: <a href="tel:5037645097" className="hover:text-blue-400 transition">(503) 764-5097</a></div>
            </div>
            {/* Small Headshot & Name at Bottom */}
            <div className="flex-1 text-center md:text-right flex flex-col items-center md:items-end">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <img src={headshot} alt="Michael V. Alfieri" className="w-12 sm:w-16 h-12 sm:h-16 rounded-full border-2 border-white shadow object-cover object-center" style={{ objectPosition: 'center 30%' }} />
                <div className="flex flex-col items-start">
                  <div className="text-xs sm:text-sm text-gray-300 font-semibold">Michael V. Alfieri</div>
                  <div className="text-xs text-gray-400">Licensed Agent</div>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 mb-4">
                <h4 className="text-lg sm:text-xl font-bold text-white mb-0">Connect</h4>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition ml-2" aria-label="LinkedIn">
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm15.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.968v5.699h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.601v5.595z"/></svg>
                </a>
              </div>
              <div className="text-xs text-gray-500 mb-2">&copy; {new Date().getFullYear()} FEX Pro. All rights reserved.</div>
              <div className="text-xs text-gray-500">Powered by FEX Pro Technologies</div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export default App;
