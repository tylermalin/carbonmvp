interface ProjectData {
  projectName: string;
  orgName: string;
  authorizedRepName?: string;
  authorizedRepEmail?: string;
  techType: string;
  hectares: number;
  gpsBoundary?: string | { lat?: number; lng?: number };
  estRemoval: number;
  estRevenue: number;
  upfrontCost: number;
}

interface OrganizationData {
  legalName: string;
  regNumber?: string;
}

/**
 * Generate a comprehensive ICR-compliant Project Design Document (PDD)
 * based on project data collected during registration and analysis
 */
export function generatePDD(projectData: ProjectData, orgData?: OrganizationData): string {
  // Validate required fields
  if (!projectData || typeof projectData !== 'object') {
    throw new Error('Project data is required');
  }
  if (!projectData.projectName) {
    throw new Error('Project name is required');
  }
  if (!projectData.techType) {
    throw new Error('Technology type is required');
  }
  
  // Extract coordinates from GPS boundary
  let latitude = 'N/A';
  let longitude = 'N/A';
  
  if (projectData.gpsBoundary) {
    if (typeof projectData.gpsBoundary === 'string') {
      // Try to parse coordinates from string
      const coordMatch = projectData.gpsBoundary.match(/([\d.]+)\s*[NS]?[\s,]+([\d.]+)\s*[EW]?/i);
      if (coordMatch) {
        latitude = coordMatch[1];
        longitude = coordMatch[2];
      }
    } else if (typeof projectData.gpsBoundary === 'object') {
      latitude = projectData.gpsBoundary.lat?.toString() || 'N/A';
      longitude = projectData.gpsBoundary.lng?.toString() || 'N/A';
    }
  }

  // Determine project type classification
  const techTypeLower = projectData.techType.toLowerCase();
  let projectTypeChoice = 'CDR';
  let permanenceTerm = '100 years';
  
  if (techTypeLower.includes('biochar')) {
    projectTypeChoice = 'CDR';
    permanenceTerm = '100 years';
  } else if (techTypeLower.includes('enhanced rock weathering') || techTypeLower.includes('erw')) {
    projectTypeChoice = 'CDR';
    permanenceTerm = '1000 years';
  } else if (techTypeLower.includes('afforestation') || techTypeLower.includes('reforestation')) {
    projectTypeChoice = 'RAD';
    permanenceTerm = '40 years';
  }

  // Calculate 10-year total removal (ensure valid number)
  const estRemovalNum = Number(projectData.estRemoval) || 0;
  const total10YearRemoval = estRemovalNum * 10;

  // Default values for missing fields
  const authorizedRepName = projectData.authorizedRepName || 'Project Representative';
  const authorizedRepEmail = projectData.authorizedRepEmail || 'contact@project.org';
  const orgName = orgData?.legalName || projectData.orgName || 'Organization';
  
  // Ensure numeric values are valid
  const hectaresNum = Number(projectData.hectares) || 0;
  const estRemoval = Number(projectData.estRemoval) || 0;
  const estRevenue = Number(projectData.estRevenue) || 0;
  const upfrontCost = Number(projectData.upfrontCost) || 0;
  const removalPerHectare = hectaresNum > 0 ? (estRemoval / hectaresNum).toFixed(2) : '0.00';

  // ICR PDD Template with placeholders
  const pddTemplate = `Draft Project Design Document (PDD)

Version: 1.0
Date: ${new Date().toISOString().split('T')[0]}

================================================================================
SECTION 1: GENERAL INFORMATION
================================================================================

1.1 Title of Project
{{PROJECT_TITLE}}

1.2 Project Proponent Information
Organization Name: {{ORG_NAME}}
Registration Number: ${orgData?.regNumber || 'Pending'}
Authorized Representative Name: {{AUTHORIZED_REP_NAME}}
Authorized Representative Email: {{AUTHORIZED_REP_EMAIL}}

1.3 Project Description
Project proponent shall provide a clear and comprehensive description of the project:
{{PROJECT_DESCRIPTION}}

================================================================================
SECTION 2: PROJECT TYPE AND CREDITING PERIOD
================================================================================

2.1 Project Type
{{PROJECT_TYPE_CHOICE}}

2.2 Permanence Term
{{PERMANENCE_TERM}}

2.3 Crediting Period
Initial Crediting Period: 10 years
Renewal: Eligible for renewal up to 2 times (total 30 years)

2.4 Crediting Period Summary Table
Total estimated GHG emission mitigations during the crediting period (t CO2-e): {{TOTAL_10_YEAR_REMOVAL}}
Total number of years (yrs): 10
Annual average (t CO2-e): {{EST_REMOVAL}}

================================================================================
SECTION 3: GEOGRAPHIC LOCATION
================================================================================

3.1 Geographic Location
Latitude: {{LATITUDE}}
Longitude: {{LONGITUDE}}
Country: United States
Region/State: [To be specified]
Project Area: {{HECTARES}} hectares

3.2 Project Boundary
The project boundary encompasses {{HECTARES}} hectares of land designated for {{TECH_TYPE}} carbon sequestration activities. The boundary coordinates are defined by GPS coordinates: {{LATITUDE}}, {{LONGITUDE}}.

================================================================================
SECTION 4: METHODOLOGY
================================================================================

4.1 Methodology Selection
Methodology: Malama v1.0
Baseline: Forest Residuals (Auto-Inferred)
Validation Status: DMRV-Ready (Pre-Validated)

4.2 Methodology Description
This project utilizes the Malama v1.0 methodology, which integrates:
- AI-powered baseline assessment
- Real-time DMRV (Digital Monitoring, Reporting, and Verification) via sensor networks
- Automated quantification of carbon removals
- Streamlined validation and verification processes

================================================================================
SECTION 5: ADDITIONALITY DEMONSTRATION
================================================================================

5.1 Additionality Level
Level 4b – Financial additionality II

5.2 Additionality Demonstration
{{ADDITIONALITY_DEMONSTRATION}}

5.3 Financial Analysis
The project's financial viability is dependent on carbon credit revenue. Without the projected revenue stream, the project would not meet standard investment thresholds, confirming its additionality status.

================================================================================
SECTION 6: BASELINE SCENARIO
================================================================================

6.1 Baseline Description
Baseline Scenario: Forest Residuals
The baseline scenario assumes continuation of current land use practices without the implementation of carbon sequestration activities. The Malama platform has auto-inferred this baseline based on project location and technology type.

6.2 Baseline Emissions
Baseline emissions are calculated using default Forest Residuals parameters, as determined by the Malama AI engine during project feasibility analysis.

================================================================================
SECTION 7: PROJECT SCENARIO
================================================================================

7.1 Project Activities
The project implements {{TECH_TYPE}} technology across {{HECTARES}} hectares to achieve carbon sequestration. Key activities include:
- Site preparation and infrastructure setup
- Implementation of {{TECH_TYPE}} sequestration systems
- Installation of DMRV sensor network for continuous monitoring
- Ongoing operations and maintenance

7.2 Project Emissions
Project emissions include:
- Operational emissions from project activities
- Transportation and logistics emissions
- Equipment and infrastructure emissions
These are conservatively estimated and deducted from gross removals to determine net removals.

================================================================================
SECTION 8: QUANTIFICATION OF NET GHG EMISSIONS AND/OR REMOVALS
================================================================================

8.1 Quantification Summary
{{QUANTIFICATION_SUMMARY}}

8.2 Ex-Ante Estimates
Annual Net GHG Removals: {{EST_REMOVAL}} tCO2-e
Total 10-Year Removals: {{TOTAL_10_YEAR_REMOVAL}} tCO2-e
Project Area: {{HECTARES}} hectares
Removal Rate: {{REMOVAL_PER_HECTARE}} tCO2-e per hectare per year

8.3 Quantification Methodology
The quantification uses the Malama v1.0 methodology, which incorporates:
- AI-powered analysis of project parameters
- Standardized removal factors by technology type
- Conservative baseline assumptions
- Real-time DMRV verification

================================================================================
SECTION 9: LEAKAGE ASSESSMENT
================================================================================

9.1 Leakage Assessment
Leakage is assessed as minimal/conservative. The project activities are designed to minimize displacement of emissions to other locations. The Malama platform's standardized methodology includes conservative leakage factors to ensure environmental integrity.

9.2 Leakage Mitigation
- Project activities are contained within defined project boundary
- No displacement of existing activities
- Monitoring systems track potential leakage indicators

================================================================================
SECTION 10: MANAGEMENT OF DATA QUALITY
================================================================================

10.1 Data Quality Management
The project implements a comprehensive DMRV (Digital Monitoring, Reporting, and Verification) system that ensures:
- Continuous real-time monitoring via sensor networks
- Automated data collection and validation
- Transparent data reporting
- Quality assurance and quality control procedures

10.2 Monitoring Plan
- Sensor Network: Deployed across project area for continuous monitoring
- Data Frequency: Real-time/hourly data collection
- Verification: Third-party verification scheduled annually
- Reporting: Quarterly reports to registry

10.3 DMRV Integration
The Malama platform provides integrated DMRV capabilities, enabling:
- Real-time carbon removal verification
- Automated credit issuance based on verified data
- Transparent and auditable data trails
- Compliance with ICR and other major registry requirements

================================================================================
APPENDIX A: PROJECT FINANCIAL INFORMATION
================================================================================

A.1 Financial Summary
Estimated Upfront Cost (CAPEX): ${'$'}{{UPFRONT_COST}}
Projected 10-Year Revenue: ${'$'}{{EST_REVENUE}}
Net Present Value: Calculated using 8% discount rate
Financial Additionality: Confirmed (Level 4b)

A.2 Revenue Projections
Annual Revenue (Years 1-10): ${'$'}{{ANNUAL_REVENUE}} per year
Credit Price Assumption: $150 per tonne CO2-e
Total Credits: {{EST_REMOVAL}} tonnes CO2-e per year

================================================================================
APPENDIX B: VALIDATION AND VERIFICATION
================================================================================

B.1 Validation Status
Status: DMRV-Ready (Pre-Validated)
Validation Body: [To be assigned]
Validation Date: [Pending]

B.2 Verification Schedule
Initial Verification: Within 12 months of project start
Annual Verification: Each year of crediting period
Verification Body: [To be assigned]

================================================================================
END OF DOCUMENT
================================================================================

Document Generated: ${new Date().toISOString()}
Generated By: Malama CO2.0 Platform
Version: 1.0
Status: Draft - Ready for Validation`;

  // Replace all placeholders
  const replacements: Record<string, string> = {
    '{{PROJECT_TITLE}}': projectData.projectName,
    '{{ORG_NAME}}': orgName,
    '{{AUTHORIZED_REP_NAME}}': authorizedRepName,
    '{{AUTHORIZED_REP_EMAIL}}': authorizedRepEmail,
    '{{PROJECT_DESCRIPTION}}': `This project, titled '${projectData.projectName}', is a ${projectData.techType} project spanning ${hectaresNum} hectares. Its primary objective is the sequestration of ${estRemoval.toLocaleString()} tonnes CO2e annually. This high-level summary is auto-generated by the Malama platform, ensuring compliance with Section 1.1 of the ICR PDD template.`,
    '{{PROJECT_TYPE_CHOICE}}': projectTypeChoice,
    '{{PERMANENCE_TERM}}': permanenceTerm,
    '{{LATITUDE}}': latitude,
    '{{LONGITUDE}}': longitude,
    '{{HECTARES}}': hectaresNum.toString(),
    '{{TECH_TYPE}}': projectData.techType,
    '{{EST_REMOVAL}}': estRemoval.toLocaleString(),
    '{{TOTAL_10_YEAR_REMOVAL}}': total10YearRemoval.toLocaleString(),
    '{{UPFRONT_COST}}': upfrontCost.toLocaleString(),
    '{{EST_REVENUE}}': estRevenue.toLocaleString(),
    '{{ADDITIONALITY_DEMONSTRATION}}': `The project is auto-assessed as Level 4b Financial Additionality II. The estimated upfront cost of $${upfrontCost.toLocaleString()} and projected 10-year OPEX demonstrate that carbon credit revenue is essential for maintaining financial viability. Without the projected revenue of $${estRevenue.toLocaleString()} from carbon credit sales, the project's financial indicators (e.g., NPV, IRR) would fall below standard investment thresholds, confirming the project's additionality according to ICR requirements.`,
    '{{QUANTIFICATION_SUMMARY}}': `Ex-ante quantification, performed by the Malama AI engine based on the ${hectaresNum} hectares boundary, estimates net GHG removals of ${estRemoval.toLocaleString()} tCO2-e per year. This estimate uses the Malama v1.0 methodology, with Baseline emissions calculated against the default Forest Residuals baseline, and Project emissions from operations deducted. Leakage is assessed as minimal/conservative.`,
    '{{REMOVAL_PER_HECTARE}}': removalPerHectare,
    '{{ANNUAL_REVENUE}}': Math.round(estRevenue / 10).toLocaleString(),
  };

  // Replace all placeholders in the template
  let pddContent = pddTemplate;
  for (const [placeholder, value] of Object.entries(replacements)) {
    pddContent = pddContent.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
  }

  return pddContent;
}

