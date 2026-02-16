import React, { useState, useEffect } from 'react';
import GeminiService from '../services/geminiService';

function GeminiTest() {
  const [connectionStatus, setConnectionStatus] = useState('testing');
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    testGeminiConnection();
  }, []);

  const testGeminiConnection = async () => {
    setConnectionStatus('testing');
    
    const result = await GeminiService.testConnection();
    
    if (result.success) {
      setConnectionStatus('connected');
      setTestResult(result.data);
    } else {
      setConnectionStatus('failed');
      setTestResult({ error: result.error });
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'testing': return 'text-yellow-600 bg-yellow-50';
      case 'connected': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'testing':
        return (
          <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
        );
      case 'connected':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'failed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`px-4 py-2 rounded-lg border shadow-lg ${getStatusColor()}`}>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm font-medium">
            {connectionStatus === 'testing' && 'Testing Gemini AI...'}
            {connectionStatus === 'connected' && 'Gemini AI Ready'}
            {connectionStatus === 'failed' && 'Gemini AI Unavailable'}
          </span>
        </div>
        
        {testResult && (
          <div className="mt-2 text-xs">
            {connectionStatus === 'connected' ? (
              <div>
                <div>Model: {testResult.model}</div>
                <div>Status: {testResult.message}</div>
              </div>
            ) : (
              <div>Error: {testResult.error}</div>
            )}
          </div>
        )}
        
        {connectionStatus === 'failed' && (
          <button 
            onClick={testGeminiConnection}
            className="mt-2 text-xs underline hover:no-underline"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

export default GeminiTest;