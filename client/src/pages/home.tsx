import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import TextEditorPanel from '@/components/TextEditorPanel';
import AnalysisPanel from '@/components/AnalysisPanel';
import FloatingCorrection from '@/components/FloatingCorrection';
import LoadingOverlay from '@/components/LoadingOverlay';
import { useTextProcessing } from '@/hooks/useTextProcessing';
import { useAnalysis } from '@/hooks/useAnalysis';
import { ProcessType, ProcessingOptions, TextIssue } from '@/lib/types';
import { RefreshCcw, Clipboard } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const Home: React.FC = () => {
  // State for text content
  const [originalText, setOriginalText] = useState<string>('');
  const [processedHtml, setProcessedHtml] = useState<string>('');
  const [activeIssue, setActiveIssue] = useState<TextIssue | null>(null);
  const [issuePosition, setIssuePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // State for tools and options
  const [activeTool, setActiveTool] = useState<ProcessType>('paraphrase');
  const [processingMode, setProcessingMode] = useState<string>('standard');
  const [targetLanguage, setTargetLanguage] = useState<string>('Spanish');

  // Process text and analysis hooks
  const { 
    processText, 
    getWordCount, 
    isProcessing, 
    error: processingError, 
    result: processingResult 
  } = useTextProcessing();

  const { 
    analyzeText, 
    isAnalyzing, 
    error: analysisError, 
    analysis 
  } = useAnalysis();

  // Text statistics state
  const [originalStats, setOriginalStats] = useState({
    words: 0,
    characters: 0,
    sentences: 0,
    paragraphs: 0,
    readingTime: 0,
    speakingTime: 0
  });

  // Computed properties
  const toolTitle = {
    paraphrase: 'Paraphrasing Tool',
    humanize: 'AI Text Humanizer',
    reword: 'Rewording Tool',
    rewriteParagraph: 'Paragraph Rewriter',
    summarize: 'Summarization Tool',
    grammarCheck: 'Grammar Checker',
    translate: 'Translation Tool'
  };

  const toolDescription = {
    paraphrase: 'Rewrite your text while maintaining the original meaning',
    humanize: 'Make AI-generated text sound more natural and human',
    reword: 'Find alternative words for your text',
    rewriteParagraph: 'Completely restructure your paragraph while keeping the meaning',
    summarize: 'Create a concise summary of your text',
    grammarCheck: 'Check grammar, spelling, and punctuation',
    translate: 'Translate your text to another language'
  };

  // Update word count when original text changes
  useEffect(() => {
    if (originalText) {
      getWordCount(originalText).then(stats => {
        if (stats) {
          setOriginalStats(stats);
        }
      });
    } else {
      setOriginalStats({
        words: 0,
        characters: 0,
        sentences: 0,
        paragraphs: 0,
        readingTime: 0,
        speakingTime: 0
      });
    }
  }, [originalText]);

  // Update text analysis when original text or processed text changes
  useEffect(() => {
    if (originalText && originalText.trim().length > 10) {
      analyzeText(originalText);
    }
  }, [originalText]);

  // Convert processed text to HTML with highlights
  useEffect(() => {
    if (processingResult?.processedText) {
      // For now, just set the processed text directly
      // In a real implementation, you would apply highlighting based on issues
      setProcessedHtml(processingResult.processedText);
    } else {
      setProcessedHtml('');
    }
  }, [processingResult]);

  // Handle processing
  const handleProcessText = async () => {
    if (!originalText.trim()) return;

    const options: ProcessingOptions = {};

    if (activeTool === 'paraphrase') {
      options.mode = processingMode as any;
    } else if (activeTool === 'translate') {
      options.targetLanguage = targetLanguage;
    }

    const result = await processText(originalText, activeTool, options);

    if (result) {
      // Since we got a successful result, analyze the processed text too
      analyzeText(result.processedText);
    }
  };

  // Handle tool change
  const handleToolChange = (tool: ProcessType) => {
    setActiveTool(tool);
  };

  // Handle mode change
  const handleModeChange = (mode: string) => {
    setProcessingMode(mode);
  };

  // Handle target language change
  const handleLanguageChange = (language: string) => {
    setTargetLanguage(language);
  };

  // Copy processed text to clipboard
  const copyToClipboard = () => {
    if (processingResult?.processedText) {
      navigator.clipboard.writeText(processingResult.processedText);
    }
  };

  // Regenerate processed text
  const regenerateText = () => {
    handleProcessText();
  };

  // Handle correction suggestion
  const handleCorrectionClick = (issue: TextIssue, event: React.MouseEvent) => {
    setActiveIssue(issue);
    setIssuePosition({ 
      x: event.clientX, 
      y: event.clientY + 20 // Position below the click
    });
  };

  // Apply suggestion
  const applyCorrection = (suggestion: string) => {
    // In a real implementation, you would apply the suggestion to the text
    setActiveIssue(null);
  };

  // Ignore suggestion
  const ignoreCorrection = () => {
    setActiveIssue(null);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar activeTool={activeTool} onSelectTool={handleToolChange} />

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden bg-gray-50">
          {/* Tool Controls */}
          <div className="bg-white border-b border-gray-200 p-5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{toolTitle[activeTool]}</h2>
                <p className="text-gray-500 text-sm">{toolDescription[activeTool]}</p>
              </div>

              <div className="flex items-center space-x-3">
                {activeTool === 'paraphrase' && (
                  <div className="flex items-center">
                    <span className="text-sm font-medium mr-2">Mode:</span>
                    <Select value={processingMode} onValueChange={handleModeChange}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Standard" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="creative">Creative</SelectItem>
                        <SelectItem value="simplified">Simplified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {activeTool === 'translate' && (
                  <div className="flex items-center">
                    <span className="text-sm font-medium mr-2">Language:</span>
                    <Select value={targetLanguage} onValueChange={handleLanguageChange}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Spanish" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Spanish">Spanish</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                        <SelectItem value="German">German</SelectItem>
                        <SelectItem value="Chinese">Chinese</SelectItem>
                        <SelectItem value="Japanese">Japanese</SelectItem>
                        <SelectItem value="Malay">Bahasa Melayu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button 
                  className="bg-primary hover:bg-primary/90 text-white"
                  onClick={handleProcessText}
                  disabled={isProcessing || !originalText.trim()}
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  {activeTool === 'paraphrase' ? 'Paraphrase' : 
                   activeTool === 'humanize' ? 'Humanize' :
                   activeTool === 'reword' ? 'Reword' :
                   activeTool === 'rewriteParagraph' ? 'Rewrite' :
                   activeTool === 'summarize' ? 'Summarize' :
                   activeTool === 'grammarCheck' ? 'Check' :
                   activeTool === 'translate' ? 'Translate' : 'Process'}
                </Button>
              </div>
            </div>
          </div>

          {/* Text Editors */}
          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
            {/* Original Text Panel */}
            <TextEditorPanel
              title="Original Text"
              text={originalText}
              onTextChange={setOriginalText}
              readOnly={false}
              statistics={originalStats}
            />

            {/* Processed Text Panel */}
            <TextEditorPanel
              title="Processed Text"
              text={processedHtml}
              readOnly={true}
              isLoading={isProcessing}
              statistics={processingResult?.processedStats}
              similarity={processingResult?.similarity}
              actions={[
                {
                  icon: <RefreshCcw className="h-4 w-4 mr-1" />,
                  label: "Regenerate",
                  onClick: regenerateText
                },
                {
                  icon: <Clipboard className="h-4 w-4 mr-1" />,
                  label: "Copy",
                  onClick: copyToClipboard
                }
              ]}
            />
          </div>
        </main>

        {/* Analysis Panel */}
        <AnalysisPanel analysis={analysis} isLoading={isAnalyzing} />
      </div>

      {/* Floating Correction Popover */}
      {activeIssue && (
        <FloatingCorrection 
          issue={activeIssue}
          position={issuePosition}
          onAccept={applyCorrection}
          onIgnore={ignoreCorrection}
        />
      )}

      {/* Loading Overlay */}
      <LoadingOverlay 
        isVisible={isProcessing} 
        message={`Processing Your ${
          activeTool === 'paraphrase' ? 'Paraphrasing' : 
          activeTool === 'humanize' ? 'Humanizing' :
          activeTool === 'reword' ? 'Rewording' :
          activeTool === 'rewriteParagraph' ? 'Rewriting' :
          activeTool === 'summarize' ? 'Summarizing' :
          activeTool === 'grammarCheck' ? 'Grammar Check' :
          activeTool === 'translate' ? 'Translation' : 'Text'
        }`} 
      />
    </div>
  );
};

export default Home;