'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: User & Organization
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    legalName: '',
    regNumber: '',
    proponentRole: '',
  });

  // Step 2: Project Details
  const [projectData, setProjectData] = useState({
    name: '',
    hectares: '',
    techType: '',
    estRemoval: '',
    estRevenue: '',
    upfrontCost: '',
  });

  const [orgId, setOrgId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setOrgId(data.organization.id);
      localStorage.setItem('token', data.token);
      localStorage.setItem('orgId', data.organization.id);
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId,
          name: projectData.name,
          hectares: parseFloat(projectData.hectares) || null,
          techType: projectData.techType || null,
          estRemoval: parseFloat(projectData.estRemoval) || null,
          estRevenue: parseFloat(projectData.estRevenue) || null,
          upfrontCost: parseFloat(projectData.upfrontCost) || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Project creation failed');
      }

      setProjectId(data.project.id);
      setStep(3);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/projects/${projectId}/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentConfirmed: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Activation failed');
      }

      alert('Project activated! All deliverables are now unlocked.');
      router.push(`/projects/${projectId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Project Registration
          </h1>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className={`flex-1 ${step >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className="text-sm font-semibold">Step 1: Account</div>
              </div>
              <div className={`flex-1 ${step >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className="text-sm font-semibold">Step 2: Project</div>
              </div>
              <div className={`flex-1 ${step >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className="text-sm font-semibold">Step 3: Purchase</div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Step 1: User & Organization Registration */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-6">
              <h2 className="text-2xl font-semibold mb-4">User & Organization Details</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.legalName}
                  onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Number
                </label>
                <input
                  type="text"
                  value={formData.regNumber}
                  onChange={(e) => setFormData({ ...formData, regNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proponent Role
                </label>
                <input
                  type="text"
                  value={formData.proponentRole}
                  onChange={(e) => setFormData({ ...formData, proponentRole: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Continue to Project Details'}
              </button>
            </form>
          )}

          {/* Step 2: Project Details */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-6">
              <h2 className="text-2xl font-semibold mb-4">Project Details</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={projectData.name}
                  onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hectares
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={projectData.hectares}
                    onChange={(e) => setProjectData({ ...projectData, hectares: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Technology Type
                  </label>
                  <input
                    type="text"
                    value={projectData.techType}
                    onChange={(e) => setProjectData({ ...projectData, techType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Est. Removal (tonnes CO₂)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={projectData.estRemoval}
                    onChange={(e) => setProjectData({ ...projectData, estRemoval: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Est. Revenue (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={projectData.estRevenue}
                    onChange={(e) => setProjectData({ ...projectData, estRevenue: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upfront Cost (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={projectData.upfrontCost}
                  onChange={(e) => setProjectData({ ...projectData, upfrontCost: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Creating Project...' : 'Continue to Purchase'}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Feasibility Package Purchase */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-4">Feasibility Package</h2>
              
              <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                <h3 className="text-xl font-semibold mb-4">Package Includes:</h3>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Project Design Document (PDD)</span>
                    <span className="ml-auto text-sm text-gray-600">LOCKED</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Sensor Map & DMRV Integration</span>
                    <span className="ml-auto text-sm text-gray-600">LOCKED</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Financial Package & Revenue Projections</span>
                    <span className="ml-auto text-sm text-gray-600">LOCKED</span>
                  </li>
                </ul>

                <div className="text-3xl font-bold text-gray-900 mb-4">
                  $16,574 USD
                </div>

                <p className="text-sm text-gray-600 mb-6">
                  Unlock all deliverables and activate your project for live monitoring.
                </p>

                <button
                  onClick={handleActivate}
                  disabled={loading}
                  className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Purchase & Activate Project'}
                </button>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400"
              >
                Back
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

