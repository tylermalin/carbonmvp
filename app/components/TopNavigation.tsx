'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function TopNavigation() {
  const pathname = usePathname();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [analyzeStep, setAnalyzeStep] = useState<number | null>(null);

  useEffect(() => {
    // Get orgId from localStorage if available
    const storedOrgId = localStorage.getItem('orgId');
    setOrgId(storedOrgId);
  }, []);

  useEffect(() => {
    // Update step when pathname changes
    if (pathname === '/analyze') {
      const updateStep = () => {
        if (typeof window !== 'undefined') {
          const step = sessionStorage.getItem('analyzeStep');
          setAnalyzeStep(step ? parseInt(step) : 1);
        }
      };
      
      updateStep();
      
      // Listen for custom step change event
      const handleStepChange = () => updateStep();
      window.addEventListener('analyzeStepChange', handleStepChange);
      
      // Also check periodically for sessionStorage changes
      const interval = setInterval(updateStep, 300);
      
      return () => {
        window.removeEventListener('analyzeStepChange', handleStepChange);
        clearInterval(interval);
      };
    } else {
      setAnalyzeStep(null);
    }
  }, [pathname]);

  const isAnalyzePage = pathname === '/analyze';
  const isProjectPage = pathname?.startsWith('/projects/');

  return (
    <nav className="bg-white border-b-2 border-gray-200 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Home Link */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-malama-primary">Malama CO2.0</span>
          </Link>

          {/* Progress Indicator (only on analyze page) */}
          {isAnalyzePage && analyzeStep && (
            <div className="flex-1 mx-8 max-w-md">
              <div className="flex items-center justify-between mb-1">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      analyzeStep >= step
                        ? 'bg-malama-primary text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step}
                  </div>
                ))}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-malama-primary h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(analyzeStep / 4) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                pathname === '/'
                  ? 'bg-malama-primary text-white'
                  : 'text-gray-700 hover:bg-malama-secondary'
              }`}
            >
              Home
            </Link>
            
            {orgId ? (
              <Link
                href="/dashboard"
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  pathname === '/dashboard'
                    ? 'bg-malama-primary text-white'
                    : 'text-gray-700 hover:bg-malama-secondary'
                }`}
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/analyze"
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  pathname === '/analyze'
                    ? 'bg-malama-primary text-white'
                    : 'bg-malama-cta text-white hover:bg-blue-700'
                }`}
              >
                Get Started
              </Link>
            )}

            {/* Project-specific back button */}
            {isProjectPage && (
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl font-semibold text-gray-700 hover:bg-malama-secondary transition-all"
              >
                ← Back to Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

