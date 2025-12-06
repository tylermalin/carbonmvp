'use client';

interface Specification {
  component: string;
  type: string;
  metric: string;
  price: string;
}

interface Setup {
  param: string;
  detail: string;
  basis: string;
}

interface Financial {
  cost: string;
  basis: string;
  estimate: string;
  emphasis?: boolean;
}

interface DMRV {
  phase: string;
  functionality: string;
  advantage: string;
}

const sensorPackageData = {
  specifications: [
    {
      component: 'Primary SOC Sensor',
      type: 'TDR/Capacitance Probe with Spectroscopy',
      metric: 'Soil Organic Carbon (SOC) percentage',
      price: '$400 - $800',
    },
    {
      component: 'Ancillary Sensor (Temp/Moisture/pH)',
      type: 'Multiparameter Probe',
      metric: 'Soil Temperature, Soil Moisture, pH Levels',
      price: '$150 - $300',
    },
    {
      component: 'IoT Gateway/Hub',
      type: 'Cellular/LoRaWAN Gateway',
      metric: 'Data Aggregation & Transmission',
      price: '$500 - $1,200',
    },
  ] as Specification[],
  setup: [
    {
      param: 'Total Sensors Deployed',
      detail: '12 units (1 Primary + 1 Ancillary per site)',
      basis: 'Sampling Density (250 hectares / 12 sites)',
    },
    {
      param: 'Verification Frequency',
      detail: 'Hourly (Continuous Streaming)',
      basis: 'Data Integrity & Real-time Issuance',
    },
    {
      param: 'Backup Systems',
      detail: 'Redundant Data Collection (Local SD card storage)',
      basis: 'Mitigate Network Failure Risk',
    },
  ] as Setup[],
  financial: [
    {
      cost: 'Sensor Hardware (CAPEX)',
      basis: '(12 Primary x $600) + (12 Ancillary x $250) + (4 Gateways x $800)',
      estimate: '$11,800',
    },
    {
      cost: 'Installation & Labor (CAPEX)',
      basis: 'Trenching, casing setup, calibration (~$300/unit)',
      estimate: '$3,600',
    },
    {
      cost: 'Total Upfront Sensor CAPEX',
      basis: 'Sum of Hardware and Installation',
      estimate: '$15,400',
      emphasis: true,
    },
    {
      cost: 'Data Transmission (OPEX)',
      basis: 'Cellular/LoRaWAN service (4 gateways x $30/month)',
      estimate: '$1,440/year',
    },
    {
      cost: 'Maintenance/Calibration (OPEX)',
      basis: 'Annual replacement of consumables (~10% of hardware CAPEX)',
      estimate: '$1,180/year',
    },
    {
      cost: 'Total Annual Monitoring OPEX',
      basis: 'Data Transmission + Maintenance',
      estimate: '$2,620/year',
      emphasis: true,
    },
  ] as Financial[],
  dmrv: [
    {
      phase: 'Sensor Online',
      functionality: 'Data Ingestion from IoT gateways to Malama libsql endpoint.',
      advantage: 'Immutability: Data is time-stamped and secured.',
    },
    {
      phase: 'Sensor Monitoring',
      functionality: 'Continuous Soil Carbon Modeling via Malama Digital Twin Protocol.',
      advantage: 'Real-Time Verification: Converts raw measurements into tCO2e hourly.',
    },
  ] as DMRV[],
};

export default function SensorDeploymentView() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center pb-6 border-b-2 border-gray-200">
        <h2 className="text-3xl font-extrabold text-malama-primary mb-2">
          🛰️ Sensor Package Ready for Deployment
        </h2>
        <p className="text-lg font-semibold text-gray-700">
          Digital Monitoring, Reporting, and Verification (DMRV) Plan
        </p>
      </div>

      {/* Section 1: Specifications */}
      <div className="bg-malama-secondary rounded-xl p-6 shadow-lg border-2 border-gray-200">
        <h3 className="text-xl font-bold text-malama-primary mb-4">1. Sensor Specifications</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white border-b-2 border-malama-primary">
                <th className="text-left py-3 px-4 font-bold text-gray-900">Component</th>
                <th className="text-left py-3 px-4 font-bold text-gray-900">Type</th>
                <th className="text-left py-3 px-4 font-bold text-gray-900">Metric</th>
                <th className="text-right py-3 px-4 font-bold text-gray-900">Price Range</th>
              </tr>
            </thead>
            <tbody>
              {sensorPackageData.specifications.map((spec, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-200 hover:bg-white transition-colors"
                >
                  <td className="py-3 px-4 font-semibold text-gray-900">{spec.component}</td>
                  <td className="py-3 px-4 text-gray-700">{spec.type}</td>
                  <td className="py-3 px-4 text-gray-700">{spec.metric}</td>
                  <td className="py-3 px-4 text-right font-medium text-malama-primary">
                    {spec.price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Setup Parameters */}
      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
        <h3 className="text-xl font-bold text-malama-primary mb-4">2. Deployment Setup</h3>
        <div className="space-y-4">
          {sensorPackageData.setup.map((item, idx) => (
            <div key={idx} className="border-l-4 border-malama-primary pl-4 py-2">
              <div className="font-bold text-gray-900 mb-1">{item.param}</div>
              <div className="text-gray-700 mb-1">{item.detail}</div>
              <div className="text-sm text-gray-500 italic">Basis: {item.basis}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Financial Breakdown */}
      <div className="bg-malama-secondary rounded-xl p-6 shadow-lg border-2 border-gray-200">
        <h3 className="text-xl font-bold text-malama-primary mb-4">3. Financial Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white border-b-2 border-malama-primary">
                <th className="text-left py-3 px-4 font-bold text-gray-900">Cost Item</th>
                <th className="text-left py-3 px-4 font-bold text-gray-900">Basis</th>
                <th className="text-right py-3 px-4 font-bold text-gray-900">Estimate</th>
              </tr>
            </thead>
            <tbody>
              {sensorPackageData.financial.map((item, idx) => (
                <tr
                  key={idx}
                  className={`border-b border-gray-200 ${
                    item.emphasis
                      ? 'bg-malama-primary text-white font-bold'
                      : 'hover:bg-white transition-colors'
                  }`}
                >
                  <td
                    className={`py-3 px-4 ${
                      item.emphasis ? 'text-white' : 'font-semibold text-gray-900'
                    }`}
                  >
                    {item.cost}
                  </td>
                  <td className={`py-3 px-4 ${item.emphasis ? 'text-white' : 'text-gray-700'}`}>
                    {item.basis}
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-bold ${
                      item.emphasis ? 'text-white text-lg' : 'text-malama-primary'
                    }`}
                  >
                    {item.estimate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 4: DMRV Integration */}
      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
        <h3 className="text-xl font-bold text-malama-primary mb-4">4. DMRV Integration Workflow</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sensorPackageData.dmrv.map((item, idx) => (
            <div
              key={idx}
              className="bg-malama-secondary rounded-xl p-5 border-2 border-malama-primary"
            >
              <div className="font-bold text-lg text-malama-primary mb-3">{item.phase}</div>
              <div className="mb-3">
                <div className="text-sm font-semibold text-gray-600 mb-1">Functionality:</div>
                <div className="text-gray-700">{item.functionality}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-1">Malama Advantage:</div>
                <div className="text-malama-primary font-semibold">{item.advantage}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

