import React, { useState, useEffect } from 'react';
import './App.css';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Features from './components/Features';
import ReadingTask from './components/ReadingTask';
import FileUpload from './components/FileUpload';
import AnalysisResults from './components/AnalysisResults';
import Stats from './components/Stats';
import Footer from './components/Footer';

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const handleAnalysisComplete = (result) => {
    setAnalysisResult(result);
    setError(null);
    setShowResults(true);
    // Scroll to results
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    setAnalysisResult(null);
    setShowResults(false);
  };

  const handleLoading = (loading) => {
    setIsLoading(loading);
  };

  const resetAnalysis = () => {
    setAnalysisResult(null);
    setError(null);
    setShowResults(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <Features />

      {/* Reading Task Section */}
      <ReadingTask />

      {/* Stats Section */}
      <Stats />

      {/* Upload Section */}
      <section id="upload" className="section-padding bg-neutral-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-6">
              Analyze Speech Patterns
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Upload an audio file and let our AI analyze speech patterns for ADHD indicators
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-large p-8 lg:p-12 card-hover">
              <FileUpload
                onAnalysisComplete={handleAnalysisComplete}
                onError={handleError}
                onLoading={handleLoading}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Loading State */}
      {isLoading && (
        <section className="section-padding bg-neutral-900 text-white">
          <div className="container-custom">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
              </div>
              <h3 className="text-2xl font-bold mb-4">Analyzing Speech Patterns</h3>
              <p className="text-neutral-300 mb-8">This may take a few moments...</p>
              <div className="flex justify-center space-x-2">
                <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-white rounded-full animate-bounce animate-delay-100"></div>
                <div className="w-3 h-3 bg-white rounded-full animate-bounce animate-delay-200"></div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Error Display */}
      {error && (
        <section className="section-padding bg-danger-50">
          <div className="container-custom">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-white rounded-2xl p-8 shadow-medium border border-danger-200">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-danger-100 rounded-full mb-6">
                  <svg className="w-8 h-8 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-danger-900 mb-4">Analysis Error</h3>
                <p className="text-danger-700 mb-6">{error}</p>
                <button
                  onClick={resetAnalysis}
                  className="btn-secondary bg-white hover:bg-danger-50 border-danger-300 text-danger-700 hover:text-danger-800"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Analysis Results */}
      {analysisResult && showResults && (
        <section id="results" className="section-padding bg-white">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-6">
                Analysis Complete
              </h2>
              <p className="text-xl text-neutral-600">
                Here are the detailed results of your speech analysis
              </p>
            </div>

            <AnalysisResults result={analysisResult} onReset={resetAnalysis} />
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

export default App;