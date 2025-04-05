
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { FileSearch } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-3xl w-full text-center space-y-6">
          <div className="flex justify-center">
            <FileSearch className="h-24 w-24 text-brand-500" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
            Document Scanning & Matching
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Efficiently search through thousands of documents to find the exact information you need, using advanced text matching algorithms.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              className="bg-brand-600 hover:bg-brand-700"
              onClick={() => navigate('/register')}
            >
              Get Started
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-2">Fast Document Matching</h3>
              <p className="text-gray-600">Quickly find similar documents using advanced text comparison algorithms.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-2">20 Free Daily Scans</h3>
              <p className="text-gray-600">Every user gets 20 free document scans per day.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-2">No External APIs</h3>
              <p className="text-gray-600">Self-contained system that processes all documents locally.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
