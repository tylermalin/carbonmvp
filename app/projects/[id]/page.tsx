'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import SensorDeploymentView from '../../components/SensorDeploymentView';

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
  pddStatus: string;
  sensorMapStatus: string;
  financialStatus: string;
  pddCompletionStatus?: string;
  sensorActivationStatus?: string;
  kycStatus?: string;
  kybStatus?: string;
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
  projectId
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  docType: DocumentType;
  projectId: string;
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
  const [credits, setCredits] = useState({ totalTonnes: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDocType, setCurrentDocType] = useState<DocumentType>(null);

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
  }, [project?.sensorActivationStatus]);

  const loadProjectData = async () => {
    try {
      // For biochar250 demo, use hardcoded data if not found
      if (projectId === 'biochar250') {
        setProject({
          id: 'biochar250',
          name: 'Idaho Biochar Restoration Project',
          status: 'Live',
          hectares: 250,
          techType: 'Biochar',
          estRemoval: 12500,
          estRevenue: 1875000,
          pddStatus: 'UNLOCKED',
          sensorMapStatus: 'UNLOCKED',
          financialStatus: 'UNLOCKED',
          pddCompletionStatus: 'NOT_COMPLETE',
          sensorActivationStatus: 'PENDING',
          kycStatus: 'PENDING',
          kybStatus: 'PENDING',
        });
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
            {/* Project Design Document Button */}
            <button
              onClick={() => {
                if (project.pddStatus === 'UNLOCKED' && project.pddCompletionStatus === 'COMPLETE') {
                  openDocumentView('PDD');
                }
              }}
              disabled={project.pddStatus !== 'UNLOCKED' || project.pddCompletionStatus !== 'COMPLETE'}
              className={`p-5 rounded-xl border-2 text-left transition-all ${
                project.pddStatus === 'UNLOCKED' && project.pddCompletionStatus === 'COMPLETE'
                  ? 'border-malama-primary bg-malama-secondary hover:bg-green-100 hover:shadow-lg cursor-pointer'
                  : 'border-gray-300 bg-gray-50 cursor-not-allowed opacity-60'
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
                <div className="text-xs text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <p className="font-semibold mb-1">Next Steps for Developer:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Complete KYC verification (Current: {project.kycStatus || 'PENDING'})</li>
                    <li>Complete KYB verification (Current: {project.kybStatus || 'PENDING'})</li>
                    <li>Collect additional required information (authorized representative name, email, etc.)</li>
                    <li>Once KYC/KYB approved, PDD will be automatically generated with complete data</li>
                  </ul>
                </div>
              )}
            </button>

            {/* Sensor Map & DMRV Button */}
            <button
              onClick={() => {
                if (project.sensorMapStatus === 'UNLOCKED') {
                  openDocumentView('SENSOR_MAP');
                }
              }}
              disabled={project.sensorMapStatus !== 'UNLOCKED'}
              className={`p-5 rounded-xl border-2 text-left transition-all ${
                project.sensorMapStatus === 'UNLOCKED'
                  ? 'border-malama-primary bg-malama-secondary hover:bg-green-100 hover:shadow-lg cursor-pointer'
                  : 'border-gray-300 bg-gray-50 cursor-not-allowed opacity-60'
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
              {project.sensorMapStatus === 'UNLOCKED' && project.sensorActivationStatus !== 'ACTIVE' && (
                <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="font-semibold mb-1">Next Steps for Developer:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Order sensor package from the deployment plan</li>
                    <li>Use Malama Sensor Activation App to:</li>
                    <li className="ml-4">- Scan sensor serial numbers</li>
                    <li className="ml-4">- Place sensors at designated locations</li>
                    <li className="ml-4">- Capture geolocation for each sensor</li>
                    <li className="ml-4">- Take installation images</li>
                    <li className="ml-4">- Turn on and validate sensors online</li>
                    <li>Once all sensors are validated, live DMRV data will be displayed</li>
                  </ul>
                </div>
              )}
            </button>

            {/* Financial Package Button */}
            <button
              onClick={() => project.financialStatus === 'UNLOCKED' && openDocumentView('FINANCIAL_PACKAGE')}
              disabled={project.financialStatus !== 'UNLOCKED'}
              className={`p-5 rounded-xl border-2 text-left transition-all ${
                project.financialStatus === 'UNLOCKED'
                  ? 'border-malama-primary bg-malama-secondary hover:bg-green-100 hover:shadow-lg cursor-pointer'
                  : 'border-gray-300 bg-gray-50 cursor-not-allowed opacity-60'
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
            </button>
          </div>
        </div>

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
      />
    </main>
  );
}

