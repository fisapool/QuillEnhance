import React from 'react';

function AnalysisPanel({ analysis }) {
  return (
    <div>
      <h2>Text Analysis</h2>
      <div>
        <p>Writing Quality: {analysis.writingQuality}</p>
        <p>Readability: {analysis.readability}</p>
        <p>Grammar: {analysis.grammar}</p>
        <p>Originality: {analysis.originality}</p>
      </div>
      <div className="progress-bar">
        <div className={`progress-indicator ${analysis.readability >= 70 ? "bg-[#34C759]" : "bg-[#FF6B6B]"}`}></div>
      </div>
      <div>
        <p>Statistics</p>
        <p>Reading Time: ~1 min</p>
        <p>Speaking Time: ~1 min</p>
        <p>Sentences: 2</p>
        <p>Paragraphs: 5</p>
      </div>
    </div>
  );
}

export default AnalysisPanel;