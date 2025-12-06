'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Project {
  id: string;
  name: string;
  status: string;
  hectares: number;
  techType: string;
  estRemoval: number;
  estRevenue: number;
  createdAt: string;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    const storedOrgId = localStorage.getItem('orgId');
    setOrgId(storedOrgId);
    
    if (storedOrgId) {
      loadProjects(storedOrgId);
    } else {
      setLoading(false);
    }
  }, []);

  const loadProjects = async (orgId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/projects/all?orgId=${orgId}`);
      const data = await response.json();
      
      if (data.success) {
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-malama-secondary">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-malama-primary border-t-transparent"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading your projects...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!orgId) {
    return (
      <main className="min-h-screen bg-malama-secondary">
        <div className="container mx-auto px-4 py-12">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-extrabold text-malama-primary mb-4">Welcome to Your Dashboard</h1>
            <p className="text-gray-600 mb-6">Please create an account to view your projects.</p>
            <Link
              href="/analyze"
              className="inline-block px-6 py-3 bg-malama-cta text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-malama-secondary">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-malama-primary mb-2">Your Projects</h1>
          <p className="text-gray-600">Manage and monitor your carbon projects</p>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🌱</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Projects Yet</h2>
            <p className="text-gray-600 mb-6">Start your first carbon project to begin tracking your impact.</p>
            <Link
              href="/analyze"
              className="inline-block px-6 py-3 bg-malama-cta text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
            >
              Create Your First Project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200 hover:border-malama-primary hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{project.name}</h3>
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-bold ${
                      project.status === 'Live'
                        ? 'bg-malama-primary text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {project.status}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Technology:</span>
                    <span className="text-sm font-semibold text-gray-900">{project.techType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Hectares:</span>
                    <span className="text-sm font-semibold text-gray-900">{project.hectares}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Est. Removal:</span>
                    <span className="text-sm font-bold text-malama-primary">
                      {project.estRemoval?.toLocaleString() || 'N/A'} tonnes
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Est. Revenue:</span>
                    <span className="text-sm font-bold text-malama-primary">
                      ${project.estRevenue?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className="text-xs text-gray-500">
                    Created: {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

