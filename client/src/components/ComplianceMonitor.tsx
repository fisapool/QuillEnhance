
import React, { useEffect, useState } from 'react';
import { Progress } from './ui/progress';

interface ComplianceScore {
  overall: number;
  details: {
    ai: number;
    plagiarism: number;
    offensive: number;
    readability: number;
  };
}

export const ComplianceMonitor: React.FC<{ text: string }> = ({ text }) => {
  const [score, setScore] = useState<ComplianceScore>({
    overall: 100,
    details: { ai: 100, plagiarism: 100, offensive: 100, readability: 100 }
  });

  useEffect(() => {
    const checkCompliance = async () => {
      try {
        const response = await fetch('/api/check-compliance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });
        
        const data = await response.json();
        const newScore = {
          overall: data.isCompliant ? 100 : 70,
          details: {
            ai: data.contentFlags.isAIGenerated ? 50 : 100,
            plagiarism: data.contentFlags.hasPlagiarism ? 50 : 100,
            offensive: data.contentFlags.hasOffensiveContent ? 0 : 100,
            readability: data.contentFlags.readabilityScore
          }
        };
        setScore(newScore);
      } catch (error) {
        console.error('Compliance check failed:', error);
      }
    };

    if (text.length > 10) {
      checkCompliance();
    }
  }, [text]);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Compliance Score</h3>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span>Overall</span>
            <span>{score.overall}%</span>
          </div>
          <Progress value={score.overall} className="h-2" />
        </div>
        {Object.entries(score.details).map(([key, value]) => (
          <div key={key}>
            <div className="flex justify-between mb-1">
              <span className="capitalize">{key}</span>
              <span>{Math.round(value)}%</span>
            </div>
            <Progress value={value} className="h-2" />
          </div>
        ))}
      </div>
    </div>
  );
};
