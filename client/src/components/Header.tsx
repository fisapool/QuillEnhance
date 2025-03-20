import React from 'react';
import { Button } from '@/components/ui/button';
import { PenTool, Settings, HelpCircle, Save } from 'lucide-react';

interface HeaderProps {
  documentName?: string;
}

const Header: React.FC<HeaderProps> = ({ documentName = 'Untitled Document' }) => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-5 flex items-center justify-between h-16">
        <div className="flex items-center space-x-1">
          <PenTool className="w-8 h-8 text-primary" />
          <h1 className="text-xl font-bold text-primary">WritePro</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" aria-label="Settings">
            <Settings className="h-5 w-5 text-gray-500 hover:text-primary transition" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Help">
            <HelpCircle className="h-5 w-5 text-gray-500 hover:text-primary transition" />
          </Button>
          <div className="flex items-center px-3 py-1 bg-green-50 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            <span className="text-sm text-green-700">Compliance Active</span>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-white">
            <Save className="h-4 w-4 mr-2" />
            Save Document
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
