import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios"; // <--- ADDED
import { useAuth } from "../context/AuthContext"; // <--- ADDED
import GeminiService from "../services/geminiService";
// import GeminiTest from "../components/GeminiTest";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function AIStylistPage() {
  // =========================
  // STATE
  // =========================
  const { user } = useAuth(); // <--- GET USER
  const [styles, setStyles] = useState([]);
  const [loadingStyles, setLoadingStyles] = useState(true);

  const [selectedImage, setSelectedImage] = useState(null);       // preview
  const [selectedImageFile, setSelectedImageFile] = useState(null); // actual file
  const [generatedImage, setGeneratedImage] = useState(null);
  
  // New state for saving
  const [isSaved, setIsSaved] = useState(false); // <--- ADDED STATE

  // New states for visual generation
  const [visualResult, setVisualResult] = useState(null);
  const [imageServicesAvailable, setImageServicesAvailable] = useState(false);
  const [showVisualOption, setShowVisualOption] = useState(true);

  // Gemini-specific states
  const [faceAnalysis, setFaceAnalysis] = useState(null);
  const [styleAnalysis, setStyleAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedShape, setDetectedShape] = useState(null);
  const [selectedGender, setSelectedGender] = useState("male");
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // =========================
  // FETCH STYLES FROM DB & CHECK GEMINI IMAGE GENERATION
  // =========================
  useEffect(() => {
    const fetchStyles = async () => {
      try {
        const res = await fetch(`${API_URL}/api/styles`);
        const data = await res.json();
        setStyles(data);
      } catch (err) {
        console.error("Failed to load styles:", err);
      } finally {
        setLoadingStyles(false);
      }
    };

    const checkImageGeneration = async () => {
      const result = await GeminiService.checkImageGenerationStatus();
      if (result.success) {
        setImageServicesAvailable(result.data.available);
      }
    };

    fetchStyles();
    checkImageGeneration();
  }, []);

  // =========================
  // SAVE TO VAULT HANDLER (NEW)
  // =========================
  const handleSaveToVault = async () => {
    if (!user) {
      alert("Please login to save styles to your vault.");
      return;
    }
    if (!generatedImage) return;

    try {
      // Ensure we have a full URL
      const imagePath = generatedImage.startsWith('http') 
        ? generatedImage 
        : `${API_URL}${generatedImage}`;

      const userId = user.id || user._id;

      await axios.post(`${API_URL}/api/user/${userId}/gallery`, {
        imageUrl: imagePath,
        name: selectedStyle.name || "AI Style"
      });

      setIsSaved(true);
      alert("Style saved to your Vault!");
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save style. Please try again.");
    }
  };

  // =========================
  // FILTER STYLES
  // =========================
  const genderStyles = styles.filter(
    (s) => s.gender?.toLowerCase() === selectedGender
  );

  let displayStyles = genderStyles;
  if (detectedShape) {
    const filtered = genderStyles.filter((style) =>
      (style.recommendedShapes || []).some(
        (s) => s.toLowerCase() === detectedShape.toLowerCase()
      )
    );
    if (filtered.length > 0) displayStyles = filtered;
  }

  // =========================
  // IMAGE UPLOAD + GEMINI FACE ANALYSIS
  // =========================
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedImageFile(file);
    setGeneratedImage(null);
    setFaceAnalysis(null);
    setStyleAnalysis(null);
    setDetectedShape(null);
    setIsSaved(false); // Reset saved state

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setSelectedImage(reader.result);
    reader.readAsDataURL(file);

    // Auto-analyze face with Gemini
    setIsAnalyzing(true);
    
    const result = await GeminiService.analyzeFace(file);
    
    if (result.success && result.data.success) {
      setFaceAnalysis(result.data.faceAnalysis);
      const detectedShapeFromAnalysis = GeminiService.extractFaceShape(result.data.faceAnalysis);
      if (detectedShapeFromAnalysis) {
        setDetectedShape(detectedShapeFromAnalysis);
      }
    } else {
      console.warn("Gemini face analysis failed:", result.error || result.data?.error);
    }
    
    setIsAnalyzing(false);
  };

  // =========================
  // GENERATE VISUAL HAIRSTYLE WITH GEMINI 3 PRO IMAGE
  // =========================
  const handleGenerate = async () => {
    if (!selectedImageFile) {
      alert("Please upload an image first");
      return;
    }

    if (!selectedStyle) {
      alert("Please select a hairstyle");
      return;
    }

    setIsProcessing(true);
    setStyleAnalysis(null);
    setVisualResult(null);
    setGeneratedImage(null);
    setIsSaved(false); // Reset saved state for new generation

    const styleOptions = {
      styleId: selectedStyle.id || selectedStyle._id,
      styleName: selectedStyle.name,
      stylePrompt: selectedStyle.ai_prompt,
      generateImage: showVisualOption // User can toggle between text-only and visual
    };

    const result = await GeminiService.generateVisualStyle(selectedImageFile, styleOptions);

    if (result.success && result.data.success) {
      // Set visual result
      if (result.data.visualTransformation && result.data.visualTransformation.success) {
        setVisualResult(result.data.visualTransformation);
        setGeneratedImage(result.data.visualTransformation.imageUrl);
      }
      
      // Set analysis if available
      if (result.data.stylingAnalysis) {
        setStyleAnalysis(result.data.stylingAnalysis);
      }
    } else {
      const errorMessage = result.data?.message || result.error || "Style generation failed";
      
      if (result.retryAfter) {
        alert(`${errorMessage} Please wait ${result.retryAfter} seconds before trying again.`);
      } else {
        alert(errorMessage);
      }
    }
    
    setIsProcessing(false);
  };

  // =========================
  // GET PERSONALIZED RECOMMENDATIONS
  // =========================
  const getRecommendations = async () => {
    if (!selectedImageFile) {
      alert("Please upload an image first");
      return;
    }

    setIsAnalyzing(true);
    
    const preferences = {
      gender: selectedGender,
      currentStyle: selectedStyle?.name || "none",
      faceShape: detectedShape || "unknown"
    };

    const result = await GeminiService.getRecommendations(selectedImageFile, preferences);

    if (result.success && result.data.success) {
      setStyleAnalysis(result.data.recommendations);
    } else {
      console.error("Recommendations error:", result.error || result.data?.error);
    }
    
    setIsAnalyzing(false);
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="min-h-screen bg-[#F9F8F6] pt-28 pb-12 px-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-10">
          <p className="text-amber-600 font-bold tracking-[0.2em] text-xs uppercase mb-3">
            Powered by 
          </p>
          <h1 className="text-4xl md:text-5xl font-serif text-stone-900">
            The LookLab Virtual Studio
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT PANEL */}
          <div className="lg:col-span-4 flex flex-col gap-6">

            {/* UPLOAD */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-serif font-bold text-stone-800">1. Upload Photo</h2>
                {isAnalyzing && (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-amber-600">Analyzing...</span>
                  </div>
                )}
                {detectedShape && !isAnalyzing && (
                  <span className="bg-amber-100 text-amber-800 px-3 py-1 text-xs rounded-full font-bold">
                    {detectedShape} Face
                  </span>
                )}
              </div>

              <div className="relative w-full h-40 rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 hover:bg-amber-50 hover:border-amber-300 transition-colors flex flex-col items-center justify-center cursor-pointer group overflow-hidden">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                {selectedImage ? (
                  <img src={selectedImage} alt="Preview" className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <>
                    <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-stone-400 mb-2 group-hover:text-amber-500">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    </div>
                    <span className="text-xs text-stone-500 font-bold uppercase tracking-wider">Upload Your Photo</span>
                  </>
                )}
              </div>
            </motion.div>

            {/* FACE ANALYSIS RESULTS */}
            {faceAnalysis && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-[2rem] border border-amber-200"
              >
                <h3 className="text-lg font-serif font-bold text-stone-800 mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-amber-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  Face Analysis
                </h3>
                <div className="text-sm text-stone-700 max-h-32 overflow-y-auto">
                  {faceAnalysis.split('\n').slice(0, 3).map((line, index) => (
                    <p key={index} className="mb-1">{line}</p>
                  ))}
                </div>
                <button 
                  onClick={getRecommendations}
                  className="mt-3 text-xs bg-amber-200 hover:bg-amber-300 text-amber-800 px-3 py-1 rounded-full font-bold transition-colors"
                >
                  Get AI Recommendations
                </button>
              </motion.div>
            )}

            {/* STYLES */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 flex-grow"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-serif font-bold text-stone-800">2. Select Style</h2>
                <div className="flex bg-stone-100 rounded-full p-1">
                  <button 
                    onClick={() => setSelectedGender("male")}
                    className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                      selectedGender === "male" ? "bg-white shadow text-stone-900" : "text-stone-400"
                    }`}
                  >
                    Male
                  </button>
                  <button 
                    onClick={() => setSelectedGender("female")}
                    className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                      selectedGender === "female" ? "bg-white shadow text-stone-900" : "text-stone-400"
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[300px] lg:max-h-[350px] pr-1">
                {loadingStyles ? (
                  <p className="text-sm text-stone-400 col-span-2 text-center py-4">Loading Catalog...</p>
                ) : displayStyles.length > 0 ? (
                  displayStyles.map((style) => (
                    <div
                      key={style._id || style.id}
                      onClick={() => setSelectedStyle(style)}
                      className={`relative rounded-xl overflow-hidden cursor-pointer aspect-square group border-2 transition-all ${
                        selectedStyle?._id === style._id ? "border-amber-400 ring-2 ring-amber-100" : "border-transparent"
                      }`}
                    >
                      <img
                        src={`/assets/styles/${style.image}`}
                        alt={style.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-end p-3">
                        <span className="text-white font-bold text-sm leading-tight">{style.name}</span>
                      </div>
                      {selectedStyle?._id === style._id && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-stone-400 col-span-2 text-center py-4 bg-stone-50 rounded-xl">
                    No styles match this face shape. Try switching gender.
                  </p>
                )}
              </div>
            </motion.div>

            {/* GENERATE BUTTON WITH OPTIONS */}
            <div className="space-y-3">
              {/* Visual Generation Toggle */}
              {imageServicesAvailable && (
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-amber-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                    <span className="text-sm font-medium text-amber-800">Visual Generation</span>
                  </div>
                  <button
                    onClick={() => setShowVisualOption(!showVisualOption)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      showVisualOption ? 'bg-amber-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        showVisualOption ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={!selectedImageFile || !selectedStyle || isProcessing}
                className="w-full py-4 bg-stone-900 text-white rounded-full font-bold shadow-lg hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isProcessing ? (
                  showVisualOption ? "Generating Visual Transformation..." : "Analyzing Style..."
                ) : (
                  showVisualOption ? "Generate Visual Transformation" : "Analyze Style Compatibility"
                )}
              </button>

              {/* Service Status */}
              <div className="text-xs text-center text-stone-500">
                {imageServicesAvailable ? (
                  <span className="flex items-center justify-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    Powered by Gemini 3 Pro Image
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1">
                    <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                    Text analysis only
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-8 bg-stone-200 rounded-[3rem] overflow-hidden relative shadow-inner border border-stone-300 min-h-[600px]"
          >
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-400 via-stone-200 to-stone-200 pointer-events-none"></div>

            {/* Content Area */}
            <div className="absolute inset-0 flex items-center justify-center p-4 md:p-12">
              
              {!styleAnalysis && !generatedImage ? (
                // STATE A: WAITING / PROCESSING
                <div className="text-center w-full max-w-lg">
                  {isProcessing ? (
                    <div className="space-y-6">
                      <div className="relative w-32 h-32 mx-auto">
                        <div className="absolute inset-0 border-4 border-stone-300 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-amber-400 rounded-full border-t-transparent animate-spin"></div>
                      </div>
                      <div>
                        <h3 className="text-2xl font-serif font-bold text-stone-800 animate-pulse">
                          {showVisualOption ? "Generating Visual Transformation..." : "Analyzing Style Compatibility..."}
                        </h3>
                        <p className="text-stone-500 mt-2">
                          {showVisualOption 
                            ? `Creating ${selectedStyle?.name} hairstyle on your photo using Gemini 3 Pro Image...`
                            : `Analyzing how ${selectedStyle?.name} would look on you...`
                          }
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-stone-300 rounded-[2rem] p-12 bg-stone-100/50">
                      <div className="mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-stone-400 mb-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 003.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                        </svg>
                      </div>
                      <p className="text-stone-400 font-serif text-xl">
                        Upload a photo and select a style to get AI-powered styling advice
                        {imageServicesAvailable && " or visual transformation"}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                // STATE B: RESULTS
                <div className="w-full h-full">
                  {generatedImage && visualResult ? (
                    // Visual transformation result
                    <div className="flex flex-col md:flex-row gap-6 h-full">
                      {/* Original Image */}
                      <div className="w-full md:w-1/2 h-48 md:h-full relative rounded-3xl overflow-hidden shadow-lg border border-white/20">
                        <img src={selectedImage} alt="Original" className="w-full h-full object-cover" />
                        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide">
                          Original
                        </div>
                      </div>

                      {/* Generated Image */}
                      <div className="w-full md:w-1/2 h-48 md:h-full relative rounded-3xl overflow-hidden shadow-lg border border-white/20">
                        <img 
                          src={`${API_URL}${generatedImage}`} 
                          alt="AI Generated Hairstyle" 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute bottom-4 left-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide">
                          {selectedStyle?.name}
                        </div>
                        
                        {/* ------------------------------------------- */}
                        {/* --- REPLACED TEXT WITH SAVE BUTTON HERE --- */}
                        {/* ------------------------------------------- */}
                        <button 
                          onClick={handleSaveToVault}
                          disabled={isSaved}
                          className="absolute top-4 right-4 bg-white/20 backdrop-blur-md hover:bg-white/40 border border-white/30 text-white p-2 rounded-full transition-all shadow-lg active:scale-95 group"
                          title={isSaved ? "Saved to Vault" : "Save to Style Vault"}
                        >
                          {isSaved ? (
                            // Filled Heart (Saved)
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-red-500">
                              <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                            </svg>
                          ) : (
                            // Outline Heart (Not Saved)
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 group-hover:text-red-400">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                            </svg>
                          )}
                        </button>
                        
                      </div>
                    </div>
                  ) : (
                    // Text analysis result
                    <div className="flex flex-col md:flex-row gap-6 h-full">
                      {/* Original Image */}
                      <div className="w-full md:w-1/3 h-48 md:h-full relative rounded-3xl overflow-hidden shadow-lg border border-white/20">
                        <img src={selectedImage} alt="Original" className="w-full h-full object-cover" />
                        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide">
                          Original
                        </div>
                      </div>

                      {/* Analysis Panel */}
                      <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/50 overflow-y-auto">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 003.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 00-3.09 3.09z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-2xl font-serif font-bold text-stone-800">{selectedStyle?.name} Analysis</h3>
                            <p className="text-stone-500 text-sm">Professional AI Styling Consultation</p>
                          </div>
                        </div>

                        <div className="prose prose-stone max-w-none">
                          {styleAnalysis && (
                            <div className="text-stone-700 leading-relaxed whitespace-pre-line">
                              {styleAnalysis}
                            </div>
                          )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-stone-200">
                          <button 
                            onClick={() => {
                              setGeneratedImage(null);
                              setStyleAnalysis(null);
                              setVisualResult(null);
                              setIsSaved(false); // Reset save state
                            }}
                            className="bg-stone-900 text-white px-6 py-2 rounded-full font-bold hover:bg-stone-800 transition-colors mr-3"
                          >
                            Try Another Style
                          </button>
                          
                          {/* Option to Save Text Analysis as well if needed */}
                          <button 
                            onClick={handleSaveToVault} 
                            disabled={isSaved}
                            className={`px-6 py-2 rounded-full font-bold transition-colors ${
                                isSaved 
                                ? "bg-green-500 text-white" 
                                : "bg-amber-500 text-white hover:bg-amber-600"
                            }`}
                          >
                            {isSaved ? "Analysis Saved!" : "Save Analysis"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

export default AIStylistPage;