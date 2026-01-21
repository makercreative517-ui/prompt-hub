import React, { useState, useEffect } from 'react';
import { Key, ExternalLink, Loader2, AlertCircle } from 'lucide-react';

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkKey = async () => {
    try {
      setLoading(true);
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (hasKey) {
        onKeySelected();
      }
    } catch (e) {
      console.error("Error checking API key:", e);
      // Don't set error here, just let the user try to select
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectKey = async () => {
    try {
      setError(null);
      await window.aistudio.openSelectKey();
      // Assume success if no error thrown, check again immediately
      // Do not use a timeout or delay as per instructions to avoid race conditions (or lack thereof)
      // The instructions say: "To mitigate this, you MUST assume the key selection was successful after triggering `openSelectKey()` and proceed to the app."
      onKeySelected();
    } catch (e: any) {
      console.error("Selection failed:", e);
      if (e.message && e.message.includes("Requested entity was not found")) {
         setError("The selected project was not found. Please try selecting a valid project again.");
      } else {
         setError("Failed to select API key. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
            <Key className="w-8 h-8 text-slate-900" />
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Access NanoPrompt Pro</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              To use the Gemini 3 Pro Image (Nano Banana Pro) models, you need to select a billing-enabled Google Cloud project.
            </p>
          </div>

          <button
            onClick={handleSelectKey}
            className="w-full py-3 px-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-slate-900 font-bold rounded-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            Select API Key
            <ExternalLink className="w-4 h-4" />
          </button>
          
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-950/50 border border-red-800/50 rounded-lg text-red-200 text-sm text-left w-full">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="pt-4 border-t border-slate-800 w-full">
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-slate-500 hover:text-slate-400 flex items-center justify-center gap-1 transition-colors"
            >
              Learn more about billing
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeySelector;