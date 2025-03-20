
import React from 'react';

export const ComplianceNotice: React.FC = () => {
  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
      <div className="flex items-start">
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">Content Guidelines</h3>
          <div className="mt-2 text-sm text-blue-700">
            <p>This service adheres to content compliance standards:</p>
            <ul className="list-disc list-inside mt-2">
              <li>Content is screened for inappropriate material</li>
              <li>AI-generated content is identified</li>
              <li>Usage is monitored for fair use</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
