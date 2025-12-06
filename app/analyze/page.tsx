'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MapTool from '../components/MapTool';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Estimates {
  removal: number;
  revenue: number;
  cost: number;
}

export default function AnalyzePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isMounted, setIsMounted] = useState(false);

  // Load step from sessionStorage after mount to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const step = sessionStorage.getItem('analyzeStep');
      if (step) {
        setCurrentStep(parseInt(step));
      }
    }
  }, []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  // Update sessionStorage when step changes and dispatch event
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('analyzeStep', currentStep.toString());
      // Dispatch custom event for navigation component
      window.dispatchEvent(new Event('analyzeStepChange'));
    }
  }, [currentStep]);

  // Step 1: Account Creation
  const [accountData, setAccountData] = useState({
    email: '',
    password: '',
    organizationName: '',
  });

  // Step 2: Project Definition
  const [projectData, setProjectData] = useState({
    projectType: '',
    hectares: '',
    location: '',
    gps_boundary: '',
  });

  // Step 3: Analysis Results
  const [estimates, setEstimates] = useState<Estimates | null>(null);

  // Stored IDs
  const [orgId, setOrgId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Step 1: Handle Account Creation
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: accountData.email,
          password: accountData.password,
          legalName: accountData.organizationName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if email already exists
        if (data.error === 'Email already registered' || data.code === 'EMAIL_EXISTS') {
          setShowLogin(true);
          setLoginData({ email: accountData.email, password: '' });
          setError('This email is already registered. Please log in to continue.');
          return;
        }
        throw new Error(data.error || 'Registration failed');
      }

      setOrgId(data.organization.id);
      setUserId(data.user.id);
      setToken(data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('orgId', data.organization.id);
      localStorage.setItem('userId', data.user.id);
      setCurrentStep(2);
      sessionStorage.setItem('analyzeStep', '2');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setOrgId(data.organization.id);
      setUserId(data.user.id);
      setToken(data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('orgId', data.organization.id);
      localStorage.setItem('userId', data.user.id);
      setShowLogin(false);
      setError(null);
      setCurrentStep(2);
      sessionStorage.setItem('analyzeStep', '2');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle Project Definition
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectData.projectType) {
      setError('Please select a project type');
      return;
    }
    if (!projectData.gps_boundary) {
      setError('Please draw a project boundary on the map');
      return;
    }
    if (!projectData.hectares || parseFloat(projectData.hectares) <= 0) {
      setError('Please draw a valid boundary on the map to calculate hectares');
      return;
    }
    setCurrentStep(3);
    sessionStorage.setItem('analyzeStep', '3');
  };

  // Step 3: Run Analysis
  useEffect(() => {
    if (currentStep === 3 && projectData.projectType && projectData.hectares) {
      runAnalysis();
    }
  }, [currentStep]);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    setAnalysisProgress(0);

    // Simulate 30-second analysis with progress bar
    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 3.33; // ~30 seconds to 100%
      });
    }, 1000);

    try {
      // Small delay to show progress animation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await fetch(`${API_URL}/api/analysis/estimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hectares: parseFloat(projectData.hectares),
          tech_type: projectData.projectType,
          gps_boundary: projectData.gps_boundary || projectData.location,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setEstimates(data.estimates);
      setAnalysisProgress(100);
      clearInterval(progressInterval);

      // Auto-advance to step 4 after showing results
      setTimeout(() => {
        setCurrentStep(4);
        sessionStorage.setItem('analyzeStep', '4');
      }, 2000);
    } catch (err: any) {
      clearInterval(progressInterval);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Handle Pro Account Upgrade
  const handleProUpgrade = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create project in database
      const projectName = `${projectData.projectType} Project - ${projectData.hectares} hectares`;
      
      const response = await fetch(`${API_URL}/api/projects`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          orgId,
          name: projectName,
          hectares: parseFloat(projectData.hectares),
          techType: projectData.projectType,
          gpsBoundary: projectData.location,
          estRemoval: estimates?.removal,
          estRevenue: estimates?.revenue,
          upfrontCost: estimates?.cost,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Project creation failed');
      }

      // Activate project (unlock deliverables)
      await fetch(`${API_URL}/api/projects/${data.project.id}/activate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentConfirmed: true }),
      });

      // Navigate to dashboard/project page
      router.push(`/projects/${data.project.id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-malama-secondary py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
          <h1 className="text-3xl font-extrabold text-malama-primary mb-8 text-center">
            Analyze Your Carbon Potential
          </h1>

          {/* Progress Indicator - Only render after mount to avoid hydration mismatch */}
          {isMounted && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`flex-1 text-center ${
                      currentStep >= step ? 'text-malama-primary' : 'text-gray-400'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center font-bold text-lg ${
                        currentStep >= step
                          ? 'bg-malama-primary text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {step}
                    </div>
                    <div className="text-xs mt-2 font-semibold">
                      {step === 1 && 'Account'}
                      {step === 2 && 'Project'}
                      {step === 3 && 'Analysis'}
                      {step === 4 && 'Unlock'}
                    </div>
                  </div>
                ))}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-malama-primary h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl">
              {error}
            </div>
          )}

          {/* Login Form Modal */}
          {showLogin && (
            <div className="mb-6 p-6 bg-malama-secondary border-2 border-malama-primary rounded-xl">
              <h3 className="text-xl font-bold text-malama-primary mb-4">
                Log In to Continue
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                This email is already registered. Please log in with your password to continue your carbon potential analysis.
              </p>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-malama-primary focus:border-malama-primary transition-all"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-malama-primary focus:border-malama-primary transition-all"
                    placeholder="Enter your password"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowLogin(false);
                      setError(null);
                      setLoginData({ email: '', password: '' });
                    }}
                    className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-malama-primary text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 shadow-lg transition-all"
                  >
                    {loading ? 'Logging in...' : 'Log In'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 1: Account Creation */}
          {currentStep === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-6">
              <h2 className="text-2xl font-bold text-malama-primary mb-6">
                Step 1: Create Your Malama Account
              </h2>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={accountData.email}
                  onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-malama-primary focus:border-malama-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={accountData.password}
                  onChange={(e) => setAccountData({ ...accountData, password: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-malama-primary focus:border-malama-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Organization Name *
                </label>
                <input
                  type="text"
                  required
                  value={accountData.organizationName}
                  onChange={(e) => setAccountData({ ...accountData, organizationName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-malama-primary focus:border-malama-primary transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-malama-cta text-white rounded-xl font-bold text-lg hover:bg-blue-700 disabled:opacity-50 shadow-lg transition-all"
              >
                {loading ? 'Creating Account...' : 'Continue'}
              </button>
            </form>
          )}

          {/* Step 2: Define Project */}
          {currentStep === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-6">
              <h2 className="text-2xl font-bold text-malama-primary mb-6">
                Step 2: Define Your Project Boundary
              </h2>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Project Type *
                </label>
                <select
                  required
                  value={projectData.projectType}
                  onChange={(e) => setProjectData({ ...projectData, projectType: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-malama-primary focus:border-malama-primary transition-all bg-white"
                >
                  <option value="">Select a project type</option>
                  <option value="Biochar">Biochar</option>
                  <option value="Enhanced Rock Weathering (ERW)">Enhanced Rock Weathering (ERW)</option>
                  <option value="Afforestation/Reforestation (A/R)">Afforestation/Reforestation (A/R)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Hectares {projectData.gps_boundary ? '(Auto-calculated from boundary)' : '*'}
                </label>
                <input
                  type="number"
                  required={!projectData.gps_boundary}
                  min="0.01"
                  step="0.01"
                  value={projectData.hectares}
                  onChange={(e) => setProjectData({ ...projectData, hectares: e.target.value })}
                  readOnly={!!projectData.gps_boundary}
                  className={`w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-malama-primary focus:border-malama-primary transition-all ${
                    projectData.gps_boundary ? 'bg-malama-secondary cursor-not-allowed' : ''
                  }`}
                  placeholder={projectData.gps_boundary ? "Calculated from boundary..." : "e.g., 250 or draw boundary"}
                />
                {projectData.gps_boundary && (
                  <p className="text-xs text-gray-600 mt-1">
                    ✓ Hectares automatically calculated from your drawn boundary
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Project Location
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  Input your address to center the map, then draw your project boundary on the map. The hectares will be automatically calculated from your drawn boundary.
                </p>
                <input
                  type="text"
                  value={projectData.location}
                  onChange={(e) => setProjectData({ ...projectData, location: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-malama-primary focus:border-malama-primary transition-all mb-3"
                  placeholder="e.g., Boise, Idaho or 43.6150 N, -116.2023 W"
                />
                <MapTool
                  onBoundaryChange={(boundary, hectares) => {
                    setProjectData({ 
                      ...projectData, 
                      gps_boundary: boundary || '',
                      hectares: hectares ? hectares.toString() : ''
                    });
                  }}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(1);
                    sessionStorage.setItem('analyzeStep', '1');
                  }}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !projectData.gps_boundary}
                  className="flex-1 py-3 bg-malama-cta text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
                >
                  {!projectData.gps_boundary ? 'Draw Boundary to Continue' : 'Analyze Carbon Potential'}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Instant Analysis & Estimates */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-malama-primary mb-6">
                Step 3: Your Carbon Potential Analysis (30 Seconds)
              </h2>
              
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">Analysis Progress</span>
                  <span className="text-sm font-semibold text-malama-primary">{Math.round(analysisProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-malama-primary h-4 rounded-full transition-all duration-300"
                    style={{ width: `${analysisProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-3 text-center font-medium">
                  {analysisProgress < 100 ? 'Running AI-powered analysis...' : 'Analysis complete!'}
                </p>
              </div>

              {/* Estimates Display */}
              {estimates && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-white border-2 border-gray-200 p-6 rounded-xl shadow-lg">
                    <div className="text-sm font-medium text-gray-500 mb-2">Estimated Removal</div>
                    <div className="text-4xl font-extrabold text-malama-primary">
                      {estimates.removal.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">tonnes CO₂</div>
                  </div>
                  <div className="bg-white border-2 border-gray-200 p-6 rounded-xl shadow-lg">
                    <div className="text-sm font-medium text-gray-500 mb-2">Estimated Revenue</div>
                    <div className="text-4xl font-extrabold text-malama-primary">
                      ${estimates.revenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">USD</div>
                  </div>
                  <div className="bg-white border-2 border-gray-200 p-6 rounded-xl shadow-lg">
                    <div className="text-sm font-medium text-gray-500 mb-2">Upfront Cost</div>
                    <div className="text-4xl font-extrabold text-malama-primary">
                      ${estimates.cost.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">USD</div>
                  </div>
                </div>
              )}

              {loading && !estimates && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-malama-primary border-t-transparent"></div>
                  <p className="mt-6 text-gray-600 font-medium">Processing your project data...</p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Paywall / Pro Account Unlock */}
          {currentStep === 4 && estimates && (
            <div className="space-y-6">
              <h2 className="text-3xl font-extrabold text-malama-primary text-center mb-4">
                Unlock Your Full Project Feasibility Report
              </h2>
              <p className="text-center text-gray-600 mb-8 font-medium">
                Access all deliverables and activate your project for live monitoring
              </p>

              {/* Deliverables Display */}
              <div className="bg-malama-secondary border-2 border-gray-300 p-6 rounded-xl shadow-lg mb-6">
                <h3 className="text-xl font-semibold text-malama-primary mb-6">Project Deliverables</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-5 bg-white rounded-xl border-2 border-gray-200 shadow-md">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">📄</span>
                      <div>
                        <div className="font-bold text-gray-900">Project Design Document (PDD)</div>
                        <div className="text-sm text-gray-600 mt-1">Complete methodology and validation documentation</div>
                      </div>
                    </div>
                    <span className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl text-sm font-bold flex items-center gap-2">
                      <span>🔒</span> LOCKED
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-5 bg-white rounded-xl border-2 border-gray-200 shadow-md">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">🗺️</span>
                      <div>
                        <div className="font-bold text-gray-900">Sensor Map & DMRV Plan</div>
                        <div className="text-sm text-gray-600 mt-1">Real-time monitoring and verification setup</div>
                      </div>
                    </div>
                    <span className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl text-sm font-bold flex items-center gap-2">
                      <span>🔒</span> LOCKED
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-5 bg-white rounded-xl border-2 border-gray-200 shadow-md">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">💰</span>
                      <div>
                        <div className="font-bold text-gray-900">Financial Package</div>
                        <div className="text-sm text-gray-600 mt-1">10-year revenue projections and financial model</div>
                      </div>
                    </div>
                    <span className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl text-sm font-bold flex items-center gap-2">
                      <span>🔒</span> LOCKED
                    </span>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-malama-secondary border-2 border-malama-primary p-6 rounded-xl mb-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-2">Estimated Carbon Removal</div>
                    <div className="text-3xl font-extrabold text-malama-primary">
                      {estimates.removal.toLocaleString()} tonnes CO₂
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-2">Projected Revenue</div>
                    <div className="text-3xl font-extrabold text-malama-primary">
                      ${estimates.revenue.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleProUpgrade}
                disabled={loading}
                className="w-full py-5 bg-malama-cta text-white rounded-xl font-extrabold text-xl hover:bg-blue-700 disabled:opacity-50 shadow-lg transition-all"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                    Processing Upgrade...
                  </span>
                ) : (
                  'Upgrade to Pro Account & Unlock Full Report'
                )}
              </button>

              <p className="text-center text-sm text-gray-500 mt-4 font-medium">
                * Simulated payment. Your project will be created and activated upon upgrade.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
