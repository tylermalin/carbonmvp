import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Malama CO2.0
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            Universal Carbon Market Operating System
          </p>
          <p className="text-lg text-gray-600 mb-12">
            Streamlined carbon project development with AI-powered feasibility analysis
            and real-time DMRV sensor verification.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/analyze"
              className="px-8 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg"
            >
              Analyze Your Carbon Potential
            </Link>
            
            <Link
              href="/projects/biochar250"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg flex items-center gap-2"
            >
              🚀 View a Live Project
              <span className="text-sm">(Idaho Biochar Restoration Project)</span>
            </Link>
          </div>
          
          <div className="mt-4 text-center">
            <Link
              href="/register"
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Or use the traditional registration flow
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">AI-Powered Analysis</h3>
              <p className="text-gray-600">
                Get instant feasibility assessments for your carbon project
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">DMRV Integration</h3>
              <p className="text-gray-600">
                Real-time sensor data verification for carbon removal
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Streamlined Process</h3>
              <p className="text-gray-600">
                From registration to credit issuance in one platform
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

