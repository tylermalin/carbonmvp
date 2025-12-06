'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import SensorDeploymentView from '../../components/SensorDeploymentView';
import SensorNetworkMap from '../../components/SensorNetworkMap';
import FinancialPackageView from '../../components/FinancialPackageView';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface SensorDataPoint {
  timestamp: string;
  value: number;
  unit: string;
  sensorId: string;
}

interface Project {
  id: string;
  name: string;
  status: string;
  hectares: number;
  techType: string;
  estRemoval: number;
  estRevenue: number;
  upfrontCost?: number;
  pddStatus: string;
  sensorMapStatus: string;
  financialStatus: string;
  pddCompletionStatus?: string;
  sensorActivationStatus?: string;
  kycStatus?: string;
  kybStatus?: string;
  gpsBoundary?: any;
}

interface Sensor {
  id: string;
  serialNum: string;
  geolocation?: { lat: number; lng: number } | null;
  activationStatus: string;
  param: string;
}

type DocumentType = 'PDD' | 'SENSOR_MAP' | 'FINANCIAL_PACKAGE' | null;

// Mock Document Content (for non-PDD documents)
const mockDocumentContent: Record<string, { title: string; content: string }> = {
  SENSOR_MAP: {
    title: '🛰️ Sensor Package Ready for Deployment',
    content: `DMRV Plan: Continuous Soil Carbon Monitoring
Primary Sensor: Sensor-123-bc
Location: 43.6150 N, -116.2023 W
Verification Frequency: Hourly
Key Metric: Soil Organic Carbon (SOC) percentage
Compliance: Malama Digital Twin Protocol

Sensor Network Configuration:
• Total Sensors: 12 units deployed
• Coverage Area: 250 hectares
• Sensor Spacing: Optimized grid pattern
• Data Transmission: Real-time via IoT network
• Backup Systems: Redundant data collection

Monitoring Parameters:
• Soil Carbon Concentration (ppm)
• Soil Temperature
• Soil Moisture Content
• pH Levels
• Organic Matter Percentage

The DMRV system provides continuous verification of carbon removal, enabling real-time credit issuance based on verified data rather than estimates.`,
  },
  FINANCIAL_PACKAGE: {
    title: '10-Year Financial Package',
    content: `Financial Projections for Idaho Biochar Restoration Project

Revenue Projections:
• Total Projected Revenue: $1,875,000
• Average Credit Price: $150/tonne CO₂
• Total Credits: 12,500 tonnes CO₂
• Revenue Timeline: 10-year period

Capital Expenditures (CAPEX):
• Total Estimated CAPEX: $450,000
• Equipment & Infrastructure: $320,000
• Initial Setup & Installation: $130,000

Operating Expenses (OPEX):
• Annual OPEX: $120,000
• Maintenance & Operations: $80,000/year
• Monitoring & Reporting: $40,000/year

Malama Platform Fees:
• Sales Fee (10%): $187,500
• Platform Access: Included in Feasibility Package

Financial Metrics:
• Net Present Value (NPV): Calculated using 8% discount rate
• Internal Rate of Return (IRR): Based on Malama's streamlined project risk assessment
• Payback Period: Estimated 3-4 years
• Break-even Analysis: Included in detailed financial model

Risk Assessment:
• Low project risk due to Malama's standardized methodology
• DMRV verification reduces validation uncertainty
• Streamlined approval process accelerates time-to-market`,
  },
};

// Document Modal Component
function DocumentModal({ 
  isOpen, 
  onClose, 
  docType,
  projectId,
  project
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  docType: DocumentType;
  projectId: string;
  project: Project | null;
}) {
  const [documentContent, setDocumentContent] = useState<string>('');
  const [documentTitle, setDocumentTitle] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && docType) {
      if (docType === 'PDD') {
        // Fetch dynamic PDD content
        loadPDDContent();
      } else if (docType === 'SENSOR_MAP') {
        // Set title for sensor deployment view
        setDocumentTitle('🛰️ Sensor Package Ready for Deployment');
        setDocumentContent('');
      } else {
        // Use mock content for other documents
        const doc = mockDocumentContent[docType];
        if (doc) {
          setDocumentTitle(doc.title);
          setDocumentContent(doc.content);
        }
      }
    }
  }, [isOpen, docType, projectId]);

  const loadPDDContent = async () => {
    setLoading(true);
    setError(null);
    setDocumentTitle('Draft Project Design Document (PDD)');

    try {
      const response = await fetch(`${API_URL}/api/projects/${projectId}/generate-pdd`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load PDD');
      }

      if (data.success) {
        setDocumentContent(data.content);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load document');
      console.error('PDD loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !docType) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b-2 border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-2xl font-bold text-malama-primary">
            {documentTitle || (docType === 'PDD' ? 'Draft Project Design Document (PDD)' : mockDocumentContent[docType]?.title)}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-malama-primary border-t-transparent"></div>
              <p className="mt-4 text-gray-600 font-medium">Generating document...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-2 border-red-200 p-4 rounded-xl text-red-700">
              {error}
            </div>
          ) : (
            <div className="prose max-w-none">
              {docType === 'PDD' ? (
                <div className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed text-sm">
                  {documentContent.split('\n').map((line, idx) => {
                    // Format section headers
                    if (line.startsWith('===') || line.startsWith('SECTION') || line.match(/^\d+\.\d+/)) {
                      return (
                        <div key={idx} className="font-bold text-malama-primary mt-4 mb-2">
                          {line}
                        </div>
                      );
                    }
                    // Format subsection headers
                    if (line.match(/^\d+\.\d+\.\d+/)) {
                      return (
                        <div key={idx} className="font-semibold text-gray-900 mt-3 mb-1">
                          {line}
                        </div>
                      );
                    }
                    return (
                      <div key={idx} className="mb-1">
                        {line}
                      </div>
                    );
                  })}
                </div>
              ) : docType === 'SENSOR_MAP' ? (
                <SensorDeploymentView />
              ) : docType === 'FINANCIAL_PACKAGE' && project ? (
                <FinancialPackageView project={project} />
              ) : (
                <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed text-sm">
                  {mockDocumentContent[docType]?.content}
                </pre>
              )}
            </div>
          )}
        </div>
        <div className="sticky bottom-0 bg-gray-50 border-t-2 border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-malama-primary text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [sensorData, setSensorData] = useState<SensorDataPoint[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [credits, setCredits] = useState({ totalTonnes: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDocType, setCurrentDocType] = useState<DocumentType>(null);
  const [showKycForm, setShowKycForm] = useState(false);
  const [showKybForm, setShowKybForm] = useState(false);
  const [showInfoForm, setShowInfoForm] = useState(false);
  const [showPurchaseFlow, setShowPurchaseFlow] = useState(false);
  const [purchaseStep, setPurchaseStep] = useState(1);
  const [kycStep, setKycStep] = useState(1);
  const [kybStep, setKybStep] = useState(1);
  const [kycVerifying, setKycVerifying] = useState(false);
  const [kybVerifying, setKybVerifying] = useState(false);

  // For demo: use hardcoded sensor ID
  const sensorId = 'sensor-123-bc';

  const openDocumentView = (docType: DocumentType) => {
    setCurrentDocType(docType);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentDocType(null);
  };

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  useEffect(() => {
    if (project) {
      loadCredits(); // Always load credits
      loadSensors(); // Load sensor network
      
      // Only load sensor data if sensors are active
      if (project.sensorActivationStatus === 'ACTIVE') {
        loadSensorData();
        
        // Set up polling for live data
        const interval = setInterval(() => {
          loadSensorData();
          loadCredits();
        }, 5000); // Update every 5 seconds

        return () => clearInterval(interval);
      }
    }
  }, [project?.sensorActivationStatus, projectId]);

  const loadSensors = async () => {
    try {
      if (projectId === 'biochar250') {
        // Already set in loadProjectData
        return;
      }
      const response = await fetch(`${API_URL}/api/sensors/${projectId}`);
      const data = await response.json();
      if (data.success) {
        setSensors(data.sensors);
      }
    } catch (error) {
      console.error('Failed to load sensors:', error);
    }
  };

  const handleKycComplete = async (formData: FormData) => {
    setKycVerifying(true);
    // Simulate Taktikal-like verification process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const response = await fetch(`${API_URL}/api/projects/${projectId}/update-kyc`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success && project) {
        setProject({ ...project, kycStatus: 'APPROVED', pddCompletionStatus: data.pddCompletionStatus });
        setShowKycForm(false);
        setKycStep(1);
        setKycVerifying(false);
        alert('KYC verification completed successfully! Identity verified and approved.');
      }
    } catch (error) {
      console.error('KYC update failed:', error);
      setKycVerifying(false);
      alert('KYC update failed');
    }
  };

  const handleKybComplete = async (formData: FormData) => {
    setKybVerifying(true);
    // Simulate Taktikal-like verification process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const response = await fetch(`${API_URL}/api/projects/${projectId}/update-kyb`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success && project) {
        setProject({ ...project, kybStatus: 'APPROVED', pddCompletionStatus: data.pddCompletionStatus });
        setShowKybForm(false);
        setKybStep(1);
        setKybVerifying(false);
        alert('KYB verification completed successfully! Business verification approved.');
      }
    } catch (error) {
      console.error('KYB update failed:', error);
      setKybVerifying(false);
      alert('KYB update failed');
    }
  };

  const handleInfoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const response = await fetch(`${API_URL}/api/projects/${projectId}/update-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorizedRepName: `${formData.get('repFirstName')} ${formData.get('repLastName')}`,
          authorizedRepEmail: formData.get('repEmail'),
          repPhone: formData.get('repPhone'),
          repTitle: formData.get('repTitle'),
          projectEmail: formData.get('projectEmail'),
          projectPhone: formData.get('projectPhone'),
          additionalNotes: formData.get('additionalNotes'),
        }),
      });
      const data = await response.json();
      if (data.success) {
        setShowInfoForm(false);
        alert('Project information updated successfully! This information will be used for PDD generation.');
      }
    } catch (error) {
      console.error('Info update failed:', error);
      alert('Update failed');
    }
  };

  const handleSensorPurchase = async () => {
    try {
      // Simulate purchase flow
      if (purchaseStep === 1) {
        setPurchaseStep(2);
      } else if (purchaseStep === 2) {
        // Simulate payment confirmation
        setPurchaseStep(3);
        setTimeout(() => {
          setShowPurchaseFlow(false);
          setPurchaseStep(1);
          alert('Sensor package purchase completed! Order will be shipped within 5-7 business days.');
        }, 2000);
      }
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  const loadProjectData = async () => {
    try {
      // For biochar250 demo, use hardcoded fully live data
      if (projectId === 'biochar250') {
        const demoProject: Project = {
          id: 'biochar250',
          name: 'Idaho Biochar Restoration Project',
          status: 'Live',
          hectares: 250,
          techType: 'Biochar',
          estRemoval: 12500,
          estRevenue: 1875000,
          upfrontCost: 450000,
          pddStatus: 'UNLOCKED',
          sensorMapStatus: 'UNLOCKED',
          financialStatus: 'UNLOCKED',
          pddCompletionStatus: 'COMPLETE', // Fully complete for demo
          sensorActivationStatus: 'ACTIVE', // Fully active for demo
          kycStatus: 'APPROVED', // Approved for demo
          kybStatus: 'APPROVED', // Approved for demo
          gpsBoundary: {
            type: 'Polygon',
            coordinates: [[
              [-116.25, 43.60],
              [-116.15, 43.60],
              [-116.15, 43.63],
              [-116.25, 43.63],
              [-116.25, 43.60]
            ]]
          },
        };
        setProject(demoProject);
        
        // Load demo sensors
        const demoSensors: Sensor[] = Array.from({ length: 12 }, (_, i) => ({
          id: `sensor-${i + 1}-bc`,
          serialNum: `SOC-${String(i + 1).padStart(3, '0')}-BC`,
          geolocation: {
            lat: 43.6150 + (Math.random() - 0.5) * 0.02,
            lng: -116.2023 + (Math.random() - 0.5) * 0.02,
          },
          activationStatus: 'ACTIVE',
          param: 'SoilCarbon',
        }));
        setSensors(demoSensors);
        
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/projects/${projectId}`);
      const data = await response.json();
      
      if (data.success) {
        setProject(data.project);
      }
    } catch (error) {
      console.error('Failed to load project:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSensorData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/data/${sensorId}/stream?limit=20`);
      const data = await response.json();
      
      if (data.success) {
        setSensorData(data.data);
      }
    } catch (error) {
      console.error('Failed to load sensor data:', error);
    }
  };

  const loadCredits = async () => {
    try {
      const response = await fetch(`${API_URL}/api/credits/${projectId}`);
      const data = await response.json();
      
      if (data.success) {
        setCredits({
          totalTonnes: data.totalTonnes || 0,
          count: data.count || 0,
        });
      }
    } catch (error) {
      console.error('Failed to load credits:', error);
      // Set defaults if API fails
      setCredits({ totalTonnes: 0, count: 0 });
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading project...</div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">Project not found</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-malama-secondary">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl font-extrabold text-malama-primary mb-3">{project.name}</h1>
          <div className="flex items-center gap-4">
            <span className={`px-4 py-2 rounded-xl text-sm font-bold ${
              project.status === 'Live' ? 'bg-malama-primary text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              {project.status}
            </span>
            <span className="text-gray-600 font-medium">{project.hectares} hectares</span>
            <span className="text-gray-600 font-medium">{project.techType}</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-200">
            <div className="text-sm font-medium text-gray-500 mb-2">Estimated Removal</div>
            <div className="text-3xl font-extrabold text-malama-primary">
              {project.estRemoval?.toLocaleString() || 'N/A'} tonnes CO₂
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-200">
            <div className="text-sm font-medium text-gray-500 mb-2">Estimated Revenue</div>
            <div className="text-3xl font-extrabold text-malama-primary">
              ${project.estRevenue?.toLocaleString() || 'N/A'}
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-200">
            <div className="text-sm font-medium text-gray-500 mb-2">Issued Credits</div>
            <div className="text-3xl font-extrabold text-malama-primary">
              {credits.totalTonnes.toFixed(2)} tonnes
            </div>
            <div className="text-sm text-gray-500 mt-2 font-medium">{credits.count} credits issued</div>
          </div>
        </div>

        {/* Deliverables Status */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border-2 border-gray-200">
          <h2 className="text-2xl font-bold text-malama-primary mb-6">Project Deliverables</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Project Design Document Card */}
            <div
              className={`p-5 rounded-xl border-2 text-left transition-all ${
                project.pddStatus === 'UNLOCKED' && project.pddCompletionStatus === 'COMPLETE'
                  ? 'border-malama-primary bg-malama-secondary hover:bg-green-100 hover:shadow-lg cursor-pointer'
                  : 'border-gray-300 bg-gray-50 opacity-60'
              }`}
            >
              <div className="font-bold mb-2 text-gray-900">Project Design Document</div>
              <div className={`text-sm flex items-center gap-2 font-medium mb-2 ${
                project.pddStatus === 'UNLOCKED' && project.pddCompletionStatus === 'COMPLETE' ? 'text-malama-primary' : 'text-gray-600'
              }`}>
                {project.pddStatus === 'UNLOCKED' ? (
                  project.pddCompletionStatus === 'COMPLETE' ? (
                    <>
                      <span>✓ Complete</span>
                      <span className="text-xs">(Click to View)</span>
                    </>
                  ) : (
                    <>
                      <span className="text-orange-600 font-bold">⚠ NOT COMPLETE</span>
                    </>
                  )
                ) : (
                  <span>🔒 Locked</span>
                )}
              </div>
              {project.pddStatus === 'UNLOCKED' && project.pddCompletionStatus === 'NOT_COMPLETE' && (
                <div className="text-xs text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200 mt-3">
                  <p className="font-semibold mb-2">Next Steps:</p>
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowKycForm(true)}
                      disabled={project.kycStatus === 'APPROVED'}
                      className={`w-full px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                        project.kycStatus === 'APPROVED'
                          ? 'bg-green-100 text-green-700 cursor-not-allowed'
                          : 'bg-malama-cta text-white hover:bg-blue-600'
                      }`}
                    >
                      {project.kycStatus === 'APPROVED' ? '✓ KYC Complete' : 'Complete KYC Verification'}
                    </button>
                    <button
                      onClick={() => setShowKybForm(true)}
                      disabled={project.kybStatus === 'APPROVED'}
                      className={`w-full px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                        project.kybStatus === 'APPROVED'
                          ? 'bg-green-100 text-green-700 cursor-not-allowed'
                          : 'bg-malama-cta text-white hover:bg-blue-600'
                      }`}
                    >
                      {project.kybStatus === 'APPROVED' ? '✓ KYB Complete' : 'Complete KYB Verification'}
                    </button>
                    <button
                      onClick={() => setShowInfoForm(true)}
                      className="w-full px-3 py-2 rounded-lg text-xs font-semibold bg-malama-primary text-white hover:bg-green-700 transition-colors"
                    >
                      Collect Additional Required Info
                    </button>
                  </div>
                </div>
              )}
              {project.pddStatus === 'UNLOCKED' && project.pddCompletionStatus === 'COMPLETE' && (
                <button
                  onClick={() => openDocumentView('PDD')}
                  className="mt-3 w-full px-3 py-2 rounded-lg text-xs font-semibold bg-malama-primary text-white hover:bg-green-700 transition-colors"
                >
                  View PDD Document
                </button>
              )}
            </div>

            {/* Sensor Map & DMRV Card */}
            <div
              className={`p-5 rounded-xl border-2 text-left transition-all ${
                project.sensorMapStatus === 'UNLOCKED'
                  ? 'border-malama-primary bg-malama-secondary hover:bg-green-100 hover:shadow-lg'
                  : 'border-gray-300 bg-gray-50 opacity-60'
              }`}
            >
              <div className="font-bold mb-2 text-gray-900">Sensor Package Ready for Deployment</div>
              <div className="text-xs text-gray-600 mb-2">
                Sensor type, setup onsite, monitoring, pricing
              </div>
              <div className={`text-sm flex items-center gap-2 font-medium mb-2 ${
                project.sensorMapStatus === 'UNLOCKED' ? 'text-malama-primary' : 'text-gray-600'
              }`}>
                {project.sensorMapStatus === 'UNLOCKED' ? (
                  <>
                    <span>✓ Package Available</span>
                    <span className="text-xs">(Click to View)</span>
                  </>
                ) : (
                  <span>🔒 Locked</span>
                )}
              </div>
              {project.sensorMapStatus === 'UNLOCKED' && (
                <div className="mt-3 space-y-2">
                  <button
                    onClick={() => openDocumentView('SENSOR_MAP')}
                    className="w-full px-3 py-2 rounded-lg text-xs font-semibold bg-malama-primary text-white hover:bg-green-700 transition-colors"
                  >
                    Review Sensor Package
                  </button>
                  {project.sensorActivationStatus !== 'ACTIVE' && (
                    <button
                      onClick={() => setShowPurchaseFlow(true)}
                      className="w-full px-3 py-2 rounded-lg text-xs font-semibold bg-malama-cta text-white hover:bg-blue-600 transition-colors"
                    >
                      Purchase Now - $15,400
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Financial Package Card */}
            <div
              className={`p-5 rounded-xl border-2 text-left transition-all ${
                project.financialStatus === 'UNLOCKED'
                  ? 'border-malama-primary bg-malama-secondary hover:bg-green-100 hover:shadow-lg'
                  : 'border-gray-300 bg-gray-50 opacity-60'
              }`}
            >
              <div className="font-bold mb-2 text-gray-900">Financial Package</div>
              <div className={`text-sm flex items-center gap-2 font-medium ${
                project.financialStatus === 'UNLOCKED' ? 'text-malama-primary' : 'text-gray-600'
              }`}>
                {project.financialStatus === 'UNLOCKED' ? (
                  <>
                    <span>✓ Unlocked</span>
                    <span className="text-xs">(Click to View)</span>
                  </>
                ) : (
                  <span>🔒 Locked</span>
                )}
              </div>
              {project.financialStatus === 'UNLOCKED' && (
                <button
                  onClick={() => openDocumentView('FINANCIAL_PACKAGE')}
                  className="mt-3 w-full px-3 py-2 rounded-lg text-xs font-semibold bg-malama-primary text-white hover:bg-green-700 transition-colors"
                >
                  View Financial Package
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sensor Network Map */}
        {project.sensorActivationStatus === 'ACTIVE' && sensors.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border-2 border-gray-200">
            <h2 className="text-2xl font-bold text-malama-primary mb-4">Sensor Network Map</h2>
            <SensorNetworkMap
              sensors={sensors}
              projectBoundary={project.gpsBoundary}
              center={{ lat: 43.6150, lng: -116.2023 }}
            />
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-malama-secondary p-3 rounded-lg">
                <div className="text-xs text-gray-600">Total Sensors</div>
                <div className="text-xl font-bold text-malama-primary">{sensors.length}</div>
              </div>
              <div className="bg-malama-secondary p-3 rounded-lg">
                <div className="text-xs text-gray-600">Active Sensors</div>
                <div className="text-xl font-bold text-green-600">
                  {sensors.filter(s => s.activationStatus === 'ACTIVE').length}
                </div>
              </div>
              <div className="bg-malama-secondary p-3 rounded-lg">
                <div className="text-xs text-gray-600">Coverage Area</div>
                <div className="text-xl font-bold text-malama-primary">{project.hectares} ha</div>
              </div>
              <div className="bg-malama-secondary p-3 rounded-lg">
                <div className="text-xs text-gray-600">Network Status</div>
                <div className="text-xl font-bold text-green-600">Online</div>
              </div>
            </div>
          </div>
        )}

        {/* Live Sensor Feed */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border-2 border-gray-200">
          <h2 className="text-2xl font-bold text-malama-primary mb-4">Live DMRV Sensor Data</h2>
          
          {project.sensorActivationStatus === 'ACTIVE' ? (
            <>
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">
                  Sensor ID: <span className="font-mono">{sensorId}</span>
                </div>
                <div className="text-sm text-malama-primary font-bold">
                  ✓ Real-time verification active
                </div>
              </div>
              
              {/* Simple Chart Visualization */}
              <div className="h-64 bg-malama-secondary rounded-xl p-4 mb-4 flex items-end justify-between gap-2 border-2 border-gray-200">
                {sensorData.slice(-10).map((point, idx) => {
                  const height = (point.value / 5) * 100; // Normalize to 0-5 range
                  return (
                    <div
                      key={idx}
                      className="flex-1 bg-malama-primary rounded-t-xl transition-all hover:opacity-80"
                      style={{ height: `${Math.min(height, 100)}%` }}
                      title={`${point.value} ${point.unit} at ${new Date(point.timestamp).toLocaleTimeString()}`}
                    />
                  );
                })}
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Timestamp</th>
                      <th className="text-right py-2">Value</th>
                      <th className="text-left py-2">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sensorData.slice(-5).reverse().map((point, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-2">{new Date(point.timestamp).toLocaleString()}</td>
                        <td className="text-right py-2 font-mono">{point.value}</td>
                        <td className="py-2">{point.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="bg-gray-50 p-8 rounded-xl border-2 border-gray-300 text-center">
              <div className="text-4xl mb-4">📡</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">Sensor Network Not Active</h3>
              <p className="text-gray-600 mb-6">
                Sensors must be activated before live DMRV data can be displayed.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-left max-w-2xl mx-auto">
                <p className="font-semibold text-gray-800 mb-2">Next Steps:</p>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>Order sensor package from the deployment plan above</li>
                  <li>Use the Malama Sensor Activation App to:</li>
                  <li className="ml-6">• Scan each sensor's serial number</li>
                  <li className="ml-6">• Place sensors at designated GPS locations</li>
                  <li className="ml-6">• Capture geolocation coordinates</li>
                  <li className="ml-6">• Take installation photos</li>
                  <li className="ml-6">• Turn on sensors and validate online connectivity</li>
                  <li>Once all sensors are validated and online, live DMRV data will appear here</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Carbon Potential Card */}
        <div className="bg-malama-secondary border-2 border-malama-primary p-6 rounded-xl shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-malama-primary mb-4">Carbon Potential</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm font-medium text-gray-600 mb-2">Estimated Removal</div>
              <div className="text-3xl font-extrabold text-malama-primary">{project.estRemoval?.toLocaleString() || 'N/A'} tonnes</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600 mb-2">Projected Revenue</div>
              <div className="text-3xl font-extrabold text-malama-primary">${project.estRevenue?.toLocaleString() || 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Modal */}
      <DocumentModal
        isOpen={isModalOpen}
        onClose={closeModal}
        docType={currentDocType}
        projectId={projectId}
        project={project}
      />

      {/* Enhanced KYC Form Modal - Taktikal-style */}
      {showKycForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-malama-primary">KYC Verification</h3>
              <button
                onClick={() => {
                  setShowKycForm(false);
                  setKycStep(1);
                  setKycVerifying(false);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Progress Indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-semibold ${kycStep >= 1 ? 'text-malama-primary' : 'text-gray-400'}`}>
                  Step 1: Personal Information
                </span>
                <span className={`text-sm font-semibold ${kycStep >= 2 ? 'text-malama-primary' : 'text-gray-400'}`}>
                  Step 2: Identity Verification
                </span>
                <span className={`text-sm font-semibold ${kycStep >= 3 ? 'text-malama-primary' : 'text-gray-400'}`}>
                  Step 3: Verification
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-malama-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(kycStep / 3) * 100}%` }}
                />
              </div>
            </div>

            {kycStep === 1 && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setKycStep(2);
                }}
                className="space-y-4"
              >
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                  <p className="text-sm text-gray-700 font-semibold mb-1">
                    🔒 Secure Identity Verification
                  </p>
                  <p className="text-xs text-gray-600">
                    Powered by Taktikal API - Supporting 11,000+ government-issued IDs worldwide
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-malama-primary focus:border-malama-primary"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-malama-primary focus:border-malama-primary"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    required
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-malama-primary focus:border-malama-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Nationality *
                  </label>
                  <select
                    name="nationality"
                    required
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-malama-primary focus:border-malama-primary"
                  >
                    <option value="">Select Nationality</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="IS">Iceland</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-malama-primary focus:border-malama-primary mb-2"
                    placeholder="123 Main Street"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      name="city"
                      required
                      placeholder="City"
                      className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-malama-primary focus:border-malama-primary"
                    />
                    <input
                      type="text"
                      name="state"
                      placeholder="State/Province"
                      className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-malama-primary focus:border-malama-primary"
                    />
                    <input
                      type="text"
                      name="postalCode"
                      required
                      placeholder="Postal Code"
                      className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-malama-primary focus:border-malama-primary"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-malama-primary text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Continue to Identity Verification →
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowKycForm(false);
                      setKycStep(1);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {kycStep === 2 && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setKycStep(3);
                }}
                className="space-y-4"
              >
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
                  <p className="text-sm text-gray-700 font-semibold">
                    ✓ Step 1 Complete: Personal Information Verified
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Government-Issued ID Type *
                  </label>
                  <select
                    name="idType"
                    required
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-malama-primary focus:border-malama-primary mb-2"
                  >
                    <option value="">Select ID Type</option>
                    <option value="passport">Passport</option>
                    <option value="drivers_license">Driver's License</option>
                    <option value="national_id">National ID Card</option>
                    <option value="residence_permit">Residence Permit</option>
                  </select>
                  <p className="text-xs text-gray-500">
                    Supporting 11,000+ government-issued IDs from 190+ countries
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ID Document Number *
                  </label>
                  <input
                    type="text"
                    name="idNumber"
                    required
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-malama-primary focus:border-malama-primary"
                    placeholder="Enter your ID number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload ID Document (Front) *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-malama-primary transition-colors">
                    <input
                      type="file"
                      name="idFront"
                      accept="image/*,.pdf"
                      required
                      className="hidden"
                      id="idFront"
                    />
                    <label
                      htmlFor="idFront"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <div className="text-4xl mb-2">📄</div>
                      <p className="text-sm font-semibold text-gray-700">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, PDF up to 10MB
                      </p>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload ID Document (Back) *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-malama-primary transition-colors">
                    <input
                      type="file"
                      name="idBack"
                      accept="image/*,.pdf"
                      required
                      className="hidden"
                      id="idBack"
                    />
                    <label
                      htmlFor="idBack"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <div className="text-4xl mb-2">📄</div>
                      <p className="text-sm font-semibold text-gray-700">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, PDF up to 10MB
                      </p>
                    </label>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      name="backgroundCheck"
                      id="backgroundCheck"
                      required
                      className="mt-1"
                    />
                    <label htmlFor="backgroundCheck" className="text-sm text-gray-700">
                      I authorize Malama to perform a background check and verify my identity using
                      real-time identity verification services. I understand this process is secure
                      and compliant with AML/KYC regulations.
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setKycStep(1)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-malama-primary text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Submit for Verification →
                  </button>
                </div>
              </form>
            )}

            {kycStep === 3 && (
              <div className="space-y-4">
                {kycVerifying ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-malama-primary border-t-transparent mb-4"></div>
                    <h4 className="text-xl font-bold text-gray-700 mb-2">
                      Verifying Identity...
                    </h4>
                    <p className="text-gray-600 mb-4">
                      Real-time identity verification in progress
                    </p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <p>✓ Document authenticity check</p>
                      <p>✓ Identity match verification</p>
                      <p>✓ Address verification</p>
                      <p>✓ Background screening</p>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      handleKycComplete(formData);
                    }}
                    className="space-y-4"
                  >
                    <div className="bg-green-50 p-6 rounded-lg border-2 border-green-300 text-center">
                      <div className="text-5xl mb-4">✅</div>
                      <h4 className="text-xl font-bold text-green-700 mb-2">
                        Verification Complete
                      </h4>
                      <p className="text-gray-700 mb-4">
                        Your identity has been successfully verified using real-time verification.
                        All documents have been validated and approved.
                      </p>
                      <div className="bg-white p-4 rounded-lg border border-green-200 text-left space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Document Verification:</span>
                          <span className="font-semibold text-green-600">✓ Approved</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Identity Match:</span>
                          <span className="font-semibold text-green-600">✓ Verified</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Address Verification:</span>
                          <span className="font-semibold text-green-600">✓ Confirmed</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Background Check:</span>
                          <span className="font-semibold text-green-600">✓ Cleared</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setKycStep(2)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                      >
                        ← Back
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-malama-primary text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                      >
                        Complete KYC Verification
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced KYB Form Modal - Taktikal-style */}
      {showKybForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-malama-primary">KYB Verification</h3>
              <button
                onClick={() => {
                  setShowKybForm(false);
                  setKybStep(1);
                  setKybVerifying(false);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Progress Indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-semibold ${kybStep >= 1 ? 'text-malama-primary' : 'text-gray-400'}`}>
                  Step 1: Business Info
                </span>
                <span className={`text-sm font-semibold ${kybStep >= 2 ? 'text-malama-primary' : 'text-gray-400'}`}>
                  Step 2: Documents
                </span>
                <span className={`text-sm font-semibold ${kybStep >= 3 ? 'text-malama-primary' : 'text-gray-400'}`}>
                  Step 3: Verification
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-malama-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(kybStep / 3) * 100}%` }}
                />
              </div>
            </div>

            {kybStep === 1 && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setKybStep(2);
                }}
                className="space-y-4"
              >
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                  <p className="text-sm text-gray-700 font-semibold mb-1">
                    🏢 Business Verification & Due Diligence
                  </p>
                  <p className="text-xs text-gray-600">
                    Powered by Taktikal API - Enhanced trust through strengthened due diligence
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Legal Business Name *
                  </label>
                  <input
                    type="text"
                    name="legalName"
                    required
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-malama-primary focus:border-malama-primary"
                    placeholder="Acme Corporation Inc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Registration Number *
                    </label>
                    <input
                      type="text"
                      name="regNumber"
                      required
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-malama-primary focus:border-malama-primary"
                      placeholder="12345678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Tax ID / EIN *
                    </label>
                    <input
                      type="text"
                      name="taxId"
                      required
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-malama-primary focus:border-malama-primary"
                      placeholder="12-3456789"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Country of Incorporation *
                  </label>
                  <select
                    name="country"
                    required
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-malama-primary focus:border-malama-primary"
                  >
                    <option value="">Select Country</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="IS">Iceland</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Business Address *
                  </label>
                  <input
                    type="text"
                    name="businessAddress"
                    required
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-malama-primary focus:border-malama-primary mb-2"
                    placeholder="456 Business Park Drive"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      name="businessCity"
                      required
                      placeholder="City"
                      className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-malama-primary focus:border-malama-primary"
                    />
                    <input
                      type="text"
                      name="businessState"
                      placeholder="State/Province"
                      className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-malama-primary focus:border-malama-primary"
                    />
                    <input
                      type="text"
                      name="businessPostalCode"
                      required
                      placeholder="Postal Code"
                      className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-malama-primary focus:border-malama-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Business Type *
                  </label>
                  <select
                    name="businessType"
                    required
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-malama-primary focus:border-malama-primary"
                  >
                    <option value="">Select Business Type</option>
                    <option value="corporation">Corporation</option>
                    <option value="llc">Limited Liability Company (LLC)</option>
                    <option value="partnership">Partnership</option>
                    <option value="sole_proprietorship">Sole Proprietorship</option>
                    <option value="nonprofit">Non-Profit Organization</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-malama-primary text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Continue to Documents →
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowKybForm(false);
                      setKybStep(1);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {kybStep === 2 && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setKybStep(3);
                }}
                className="space-y-4"
              >
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
                  <p className="text-sm text-gray-700 font-semibold">
                    ✓ Step 1 Complete: Business Information Verified
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Business Registration Certificate *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-malama-primary transition-colors">
                    <input
                      type="file"
                      name="registrationCert"
                      accept="image/*,.pdf"
                      required
                      className="hidden"
                      id="registrationCert"
                    />
                    <label
                      htmlFor="registrationCert"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <div className="text-4xl mb-2">📋</div>
                      <p className="text-sm font-semibold text-gray-700">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, PDF up to 10MB
                      </p>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Articles of Incorporation *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-malama-primary transition-colors">
                    <input
                      type="file"
                      name="articles"
                      accept="image/*,.pdf"
                      required
                      className="hidden"
                      id="articles"
                    />
                    <label
                      htmlFor="articles"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <div className="text-4xl mb-2">📄</div>
                      <p className="text-sm font-semibold text-gray-700">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, PDF up to 10MB
                      </p>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Beneficial Ownership Information *
                  </label>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Owner 1 - Full Name *
                      </label>
                      <input
                        type="text"
                        name="owner1Name"
                        required
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-malama-primary focus:border-malama-primary"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Ownership % *
                        </label>
                        <input
                          type="number"
                          name="owner1Percent"
                          required
                          min="0"
                          max="100"
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-malama-primary focus:border-malama-primary"
                          placeholder="25"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Date of Birth *
                        </label>
                        <input
                          type="date"
                          name="owner1Dob"
                          required
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-malama-primary focus:border-malama-primary"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="mt-2 text-sm text-malama-primary hover:underline"
                  >
                    + Add Additional Owner
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Organizational Structure Document (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-malama-primary transition-colors">
                    <input
                      type="file"
                      name="orgStructure"
                      accept="image/*,.pdf"
                      className="hidden"
                      id="orgStructure"
                    />
                    <label
                      htmlFor="orgStructure"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <div className="text-4xl mb-2">📊</div>
                      <p className="text-sm font-semibold text-gray-700">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, PDF up to 10MB
                      </p>
                    </label>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      name="kybAuthorization"
                      id="kybAuthorization"
                      required
                      className="mt-1"
                    />
                    <label htmlFor="kybAuthorization" className="text-sm text-gray-700">
                      I certify that all information provided is accurate and complete. I authorize
                      Malama to perform business verification and due diligence checks in compliance
                      with AML/KYB regulations.
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setKybStep(1)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-malama-primary text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Submit for Verification →
                  </button>
                </div>
              </form>
            )}

            {kybStep === 3 && (
              <div className="space-y-4">
                {kybVerifying ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-malama-primary border-t-transparent mb-4"></div>
                    <h4 className="text-xl font-bold text-gray-700 mb-2">
                      Verifying Business...
                    </h4>
                    <p className="text-gray-600 mb-4">
                      Enhanced due diligence verification in progress
                    </p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <p>✓ Business registration verification</p>
                      <p>✓ Tax ID validation</p>
                      <p>✓ Beneficial ownership verification</p>
                      <p>✓ Sanctions screening</p>
                      <p>✓ PEP (Politically Exposed Person) check</p>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      handleKybComplete(formData);
                    }}
                    className="space-y-4"
                  >
                    <div className="bg-green-50 p-6 rounded-lg border-2 border-green-300 text-center">
                      <div className="text-5xl mb-4">✅</div>
                      <h4 className="text-xl font-bold text-green-700 mb-2">
                        Business Verification Complete
                      </h4>
                      <p className="text-gray-700 mb-4">
                        Your business has been successfully verified through enhanced due diligence.
                        All documents have been validated and approved.
                      </p>
                      <div className="bg-white p-4 rounded-lg border border-green-200 text-left space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Registration Verification:</span>
                          <span className="font-semibold text-green-600">✓ Approved</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tax ID Validation:</span>
                          <span className="font-semibold text-green-600">✓ Verified</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Beneficial Ownership:</span>
                          <span className="font-semibold text-green-600">✓ Confirmed</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sanctions Screening:</span>
                          <span className="font-semibold text-green-600">✓ Cleared</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setKybStep(2)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                      >
                        ← Back
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-malama-primary text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                      >
                        Complete KYB Verification
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Info Collection Form Modal */}
      {showInfoForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-malama-primary">Collect Additional Required Information</h3>
              <button
                onClick={() => setShowInfoForm(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
              <p className="text-sm text-gray-700 font-semibold mb-1">
                📋 Project Documentation Requirements
              </p>
              <p className="text-xs text-gray-600">
                Complete this form to finalize your Project Design Document (PDD) generation.
                All information will be securely stored and used for compliance purposes.
              </p>
            </div>

            <form onSubmit={handleInfoSubmit} className="space-y-4">
              <div className="bg-malama-secondary p-4 rounded-lg border-2 border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3">Authorized Representative Information</h4>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="repFirstName"
                      required
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-malama-primary focus:border-malama-primary"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="repLastName"
                      required
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-malama-primary focus:border-malama-primary"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="repEmail"
                    required
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-malama-primary focus:border-malama-primary"
                    placeholder="john.doe@example.com"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="repPhone"
                    required
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-malama-primary focus:border-malama-primary"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Title / Position *
                  </label>
                  <input
                    type="text"
                    name="repTitle"
                    required
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-malama-primary focus:border-malama-primary"
                    placeholder="CEO, Project Manager, etc."
                  />
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3">Project Contact Information</h4>
                
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Project Contact Email *
                  </label>
                  <input
                    type="email"
                    name="projectEmail"
                    required
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-malama-primary focus:border-malama-primary"
                    placeholder="project@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Project Contact Phone
                  </label>
                  <input
                    type="tel"
                    name="projectPhone"
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-malama-primary focus:border-malama-primary"
                    placeholder="+1 (555) 987-6543"
                  />
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3">Additional Notes</h4>
                <textarea
                  name="additionalNotes"
                  rows={4}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-malama-primary focus:border-malama-primary"
                  placeholder="Any additional information relevant to the project..."
                />
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    name="infoConsent"
                    id="infoConsent"
                    required
                    className="mt-1"
                  />
                  <label htmlFor="infoConsent" className="text-sm text-gray-700">
                    I confirm that all information provided is accurate and complete. I authorize
                    Malama to use this information for project documentation and compliance purposes.
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-malama-primary text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Submit Information
                </button>
                <button
                  type="button"
                  onClick={() => setShowInfoForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sensor Purchase Flow Modal */}
      {showPurchaseFlow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-2xl font-bold text-malama-primary mb-4">Purchase Sensor Package</h3>
            
            {purchaseStep === 1 && (
              <div className="space-y-4">
                <div className="bg-malama-secondary p-4 rounded-lg border-2 border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-2">Package Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>12 Primary SOC Sensors</span>
                      <span className="font-semibold">$7,200</span>
                    </div>
                    <div className="flex justify-between">
                      <span>12 Ancillary Sensors</span>
                      <span className="font-semibold">$3,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>4 IoT Gateways</span>
                      <span className="font-semibold">$3,200</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Installation & Labor</span>
                      <span className="font-semibold">$3,600</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t-2 border-malama-primary font-bold text-lg">
                      <span>Total</span>
                      <span className="text-malama-primary">$17,000</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setPurchaseStep(2)}
                    className="flex-1 px-4 py-2 bg-malama-cta text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                  >
                    Proceed to Payment
                  </button>
                  <button
                    onClick={() => {
                      setShowPurchaseFlow(false);
                      setPurchaseStep(1);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {purchaseStep === 2 && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700 mb-2">Payment Method (Demo)</p>
                  <select className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg">
                    <option>Credit Card - Simulated</option>
                    <option>Bank Transfer - Simulated</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSensorPurchase}
                    className="flex-1 px-4 py-2 bg-malama-primary text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Complete Purchase
                  </button>
                  <button
                    onClick={() => setPurchaseStep(1)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}

            {purchaseStep === 3 && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-malama-primary border-t-transparent mb-4"></div>
                <p className="text-lg font-semibold text-gray-700">Processing payment...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

