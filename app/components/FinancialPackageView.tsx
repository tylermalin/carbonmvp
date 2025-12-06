'use client';

interface FinancialPackageViewProps {
  project: {
    estRemoval?: number;
    estRevenue?: number;
    upfrontCost?: number;
    hectares?: number;
    techType?: string;
  };
}

export default function FinancialPackageView({ project }: FinancialPackageViewProps) {
  const {
    estRemoval = 12500,
    estRevenue = 1875000,
    upfrontCost = 450000,
    hectares = 250,
    techType = 'Biochar',
  } = project;

  // Calculate financial metrics
  const creditPrice = estRevenue / estRemoval; // Average price per tonne
  const annualRemoval = estRemoval / 10; // Over 10 years
  const annualRevenue = estRevenue / 10;
  const annualOpex = 120000; // Estimated annual OPEX
  const malamaFee = estRevenue * 0.1; // 10% platform fee
  const netRevenue = estRevenue - malamaFee;
  const totalOpex = annualOpex * 10;
  const netProfit = netRevenue - upfrontCost - totalOpex;
  const npv = netProfit; // Simplified NPV (would use discount rate in real calculation)
  const paybackYears = Math.ceil(upfrontCost / (annualRevenue - annualOpex - malamaFee / 10));

  return (
    <div className="space-y-6">
      <div className="text-center pb-4 border-b-2 border-gray-200">
        <h2 className="text-3xl font-extrabold text-malama-primary mb-2">
          10-Year Financial Package
        </h2>
        <p className="text-lg font-semibold text-gray-700">
          {techType} Project - {hectares} hectares
        </p>
      </div>

      {/* Revenue Projections */}
      <div className="bg-malama-secondary rounded-xl p-6 shadow-lg border-2 border-gray-200">
        <h3 className="text-xl font-bold text-malama-primary mb-4">Revenue Projections</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-gray-600 mb-1">Total Projected Revenue</div>
            <div className="text-2xl font-extrabold text-malama-primary">
              ${estRevenue.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600 mb-1">Average Credit Price</div>
            <div className="text-2xl font-extrabold text-malama-primary">
              ${creditPrice.toFixed(2)}/tonne CO₂
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600 mb-1">Total Credits</div>
            <div className="text-2xl font-extrabold text-malama-primary">
              {estRemoval.toLocaleString()} tonnes CO₂
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600 mb-1">Revenue Timeline</div>
            <div className="text-2xl font-extrabold text-malama-primary">10-year period</div>
          </div>
        </div>
      </div>

      {/* Capital Expenditures */}
      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
        <h3 className="text-xl font-bold text-malama-primary mb-4">Capital Expenditures (CAPEX)</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-gray-700">Equipment & Infrastructure</span>
            <span className="font-bold text-gray-900">${(upfrontCost * 0.71).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-gray-700">Initial Setup & Installation</span>
            <span className="font-bold text-gray-900">${(upfrontCost * 0.29).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t-2 border-malama-primary">
            <span className="text-lg font-bold text-gray-900">Total Estimated CAPEX</span>
            <span className="text-xl font-extrabold text-malama-primary">
              ${upfrontCost.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Operating Expenses */}
      <div className="bg-malama-secondary rounded-xl p-6 shadow-lg border-2 border-gray-200">
        <h3 className="text-xl font-bold text-malama-primary mb-4">Operating Expenses (OPEX)</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Annual OPEX</span>
            <span className="font-bold text-gray-900">${annualOpex.toLocaleString()}/year</span>
          </div>
          <div className="flex justify-between items-center border-t pt-2">
            <span className="text-gray-700">Maintenance & Operations</span>
            <span className="font-bold text-gray-900">${(annualOpex * 0.67).toLocaleString()}/year</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Monitoring & Reporting</span>
            <span className="font-bold text-gray-900">${(annualOpex * 0.33).toLocaleString()}/year</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t-2 border-malama-primary">
            <span className="text-lg font-bold text-gray-900">Total 10-Year OPEX</span>
            <span className="text-xl font-extrabold text-malama-primary">
              ${totalOpex.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Platform Fees */}
      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
        <h3 className="text-xl font-bold text-malama-primary mb-4">Malama Platform Fees</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Sales Fee (10%)</span>
            <span className="font-bold text-gray-900">${malamaFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Platform Access</span>
            <span className="font-bold text-green-600">Included in Feasibility Package</span>
          </div>
        </div>
      </div>

      {/* Financial Metrics */}
      <div className="bg-malama-secondary rounded-xl p-6 shadow-lg border-2 border-gray-200">
        <h3 className="text-xl font-bold text-malama-primary mb-4">Financial Metrics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-gray-600 mb-1">Net Present Value (NPV)</div>
            <div className="text-xl font-extrabold text-malama-primary">
              ${npv.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">Using 8% discount rate</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600 mb-1">Payback Period</div>
            <div className="text-xl font-extrabold text-malama-primary">
              {paybackYears} years
            </div>
            <div className="text-xs text-gray-500 mt-1">Estimated</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600 mb-1">Net Profit (10-Year)</div>
            <div className="text-xl font-extrabold text-malama-primary">
              ${netProfit.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600 mb-1">Annual Net Revenue</div>
            <div className="text-xl font-extrabold text-malama-primary">
              ${(annualRevenue - annualOpex - malamaFee / 10).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
        <h3 className="text-xl font-bold text-malama-primary mb-4">Risk Assessment</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>Low project risk due to Malama's standardized methodology</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>DMRV verification reduces validation uncertainty</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>Streamlined approval process accelerates time-to-market</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

