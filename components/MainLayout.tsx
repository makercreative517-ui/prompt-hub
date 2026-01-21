import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Sparkles, 
  Image as ImageIcon, 
  Copy, 
  CheckCircle2, 
  RefreshCw,
  Wand2,
  Zap
} from 'lucide-react';
import { describeImageForPrompt, generateImageFromPrompt } from '../services/geminiService';
import { AspectRatio, ImageSize } from '../types';

const MainLayout: React.FC = () => {
  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);
  
  // Config for generation
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.Square);
  const [imageSize, setImageSize] = useState<ImageSize>(ImageSize.OneK);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviewUrl(ev.target?.result as string);
        // Reset downstream states
        setGeneratedPrompt("");
        setGeneratedImageUrl(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => {
          setPreviewUrl(ev.target?.result as string);
          setGeneratedPrompt("");
          setGeneratedImageUrl(null);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const generatePrompt = async () => {
    if (!previewUrl || !selectedFile) return;

    setIsAnalyzing(true);
    setGeneratedPrompt("");
    
    try {
      // Remove data:image/xxx;base64, prefix
      const base64Data = previewUrl.split(',')[1];
      const mimeType = selectedFile.type;
      
      const prompt = await describeImageForPrompt(base64Data, mimeType);
      setGeneratedPrompt(prompt);
    } catch (error) {
      console.error(error);
      alert("Failed to analyze image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateImage = async () => {
    if (!generatedPrompt) return;

    setIsGeneratingImage(true);
    setGeneratedImageUrl(null);

    try {
      const url = await generateImageFromPrompt(generatedPrompt, aspectRatio, imageSize);
      setGeneratedImageUrl(url);
    } catch (error) {
      console.error(error);
      alert("Failed to generate image. Ensure you have a valid project with billing enabled.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-yellow-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center transform rotate-3">
              <Sparkles className="w-5 h-5 text-slate-900" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              NanoPrompt <span className="text-yellow-400">Pro</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <span>POWERED BY GEMINI 3 PRO</span>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Intro */}
        <section className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Reverse Engineer Your Images</h2>
          <p className="text-slate-400">
            Upload any image to generate a professional-grade prompt optimized for the <span className="text-yellow-400 font-medium">Nano Banana Pro</span> (Gemini 3 Pro Image) model.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Left Column: Input & Analysis */}
          <div className="space-y-6">
            
            {/* Image Uploader */}
            <div 
              className={`
                relative group border-2 border-dashed rounded-3xl overflow-hidden transition-all duration-300
                ${previewUrl ? 'border-slate-700 bg-slate-900/50' : 'border-slate-700 hover:border-yellow-500/50 bg-slate-900/30 hover:bg-slate-900/50'}
                ${isAnalyzing ? 'opacity-50 pointer-events-none' : ''}
              `}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileSelect}
              />
              
              <div className="aspect-[4/3] flex flex-col items-center justify-center p-6 text-center cursor-pointer">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="absolute inset-0 w-full h-full object-contain bg-black/50 p-4" 
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                      <Upload className="w-8 h-8 text-slate-400 group-hover:text-yellow-400 transition-colors" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-slate-200">Drop an image here</p>
                      <p className="text-sm text-slate-500">or click to browse</p>
                    </div>
                  </div>
                )}
                
                {/* Overlay Button for Change Image if exists */}
                {previewUrl && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-medium border border-slate-700 shadow-xl">
                      Change Image
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={generatePrompt}
              disabled={!previewUrl || isAnalyzing}
              className={`
                w-full py-4 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all
                ${!previewUrl 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : isAnalyzing
                    ? 'bg-slate-800 text-slate-400 cursor-wait'
                    : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 hover:shadow-[0_0_20px_rgba(250,204,21,0.3)] transform hover:-translate-y-0.5'
                }
              `}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Analyzing Pixels...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  Generate Prompt
                </>
              )}
            </button>
          </div>

          {/* Right Column: Output & Test */}
          <div className="space-y-6">
            
            {/* Prompt Output */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 min-h-[300px] flex flex-col relative overflow-hidden">
               {/* Label */}
               <div className="flex items-center justify-between mb-4">
                 <h3 className="text-slate-400 font-medium text-sm uppercase tracking-wider">Generated Prompt</h3>
                 {generatedPrompt && (
                   <button 
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 text-xs font-medium text-yellow-400 hover:text-yellow-300 transition-colors bg-yellow-400/10 px-3 py-1.5 rounded-full"
                   >
                     {copyFeedback ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                     {copyFeedback ? 'Copied!' : 'Copy'}
                   </button>
                 )}
               </div>

               {/* Content */}
               <div className="flex-1">
                 {generatedPrompt ? (
                   <textarea
                    value={generatedPrompt}
                    onChange={(e) => setGeneratedPrompt(e.target.value)}
                    className="w-full h-full bg-transparent border-0 resize-none focus:ring-0 p-0 text-slate-200 text-lg leading-relaxed font-light font-sans"
                   />
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center text-slate-700 gap-3 select-none">
                     <ImageIcon className="w-12 h-12 opacity-20" />
                     <p className="text-sm">Prompt will appear here</p>
                   </div>
                 )}
               </div>
            </div>

            {/* Test Section */}
            {generatedPrompt && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 animate-fade-in-up">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    Test with Nano Banana Pro
                  </h3>
                  <div className="flex gap-2">
                    <select 
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                      className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-2 py-1 outline-none focus:border-yellow-500"
                    >
                      {Object.values(AspectRatio).map(ratio => (
                        <option key={ratio} value={ratio}>{ratio}</option>
                      ))}
                    </select>
                    <select 
                      value={imageSize}
                      onChange={(e) => setImageSize(e.target.value as ImageSize)}
                      className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-2 py-1 outline-none focus:border-yellow-500"
                    >
                      {Object.values(ImageSize).map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {generatedImageUrl ? (
                  <div className="space-y-4">
                    <div className="relative rounded-xl overflow-hidden border border-slate-700 shadow-2xl bg-black/50">
                      <img src={generatedImageUrl} alt="Generated" className="w-full h-auto object-contain max-h-[400px]" />
                    </div>
                    <button
                      onClick={() => setGeneratedImageUrl(null)}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      Close Preview
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={generateImage}
                    disabled={isGeneratingImage}
                    className={`
                      w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all border border-slate-700
                      ${isGeneratingImage 
                        ? 'bg-slate-800 text-slate-400' 
                        : 'bg-slate-800 hover:bg-slate-700 text-white hover:border-yellow-500/50'
                      }
                    `}
                  >
                    {isGeneratingImage ? 'Generating Image...' : 'Generate Test Image'}
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-4 py-8 text-center text-slate-600 text-sm">
        <p>Using Google Gemini 3 Pro Preview & Gemini 3 Pro Image Preview</p>
      </footer>
    </div>
  );
};

export default MainLayout;