import React from 'react';

const Hero = () => {
  const scrollToUpload = () => {
    document.getElementById('reading')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="min-h-screen flex items-center bg-gradient-to-br from-neutral-900 via-neutral-800 to-black relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-accent-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-8 animate-fade-in-up">
            <span className="w-2 h-2 bg-accent-400 rounded-full mr-2"></span>
            AI-Powered Speech Analysis
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl lg:text-7xl xl:text-8xl font-black text-white mb-8 leading-tight animate-fade-in-up animate-delay-100">
            Detect ADHD
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-primary-400">
              Through Speech
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl lg:text-2xl text-neutral-300 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animate-delay-200">
            Advanced AI technology analyzes speech patterns in Sinhala-speaking children to identify
            potential ADHD indicators with clinical-grade accuracy.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in-up animate-delay-300">
            <button
              onClick={scrollToUpload}
              className="btn-primary bg-white text-black hover:bg-neutral-100 px-8 py-4 text-lg"
            >
              Start Reading Task
            </button>
            <button className="btn-secondary text-white border-white hover:bg-white hover:text-black px-8 py-4 text-lg">
              Learn More
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in-up animate-delay-400">
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-white mb-2">95%</div>
              <div className="text-neutral-400 text-sm">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-white mb-2">2min</div>
              <div className="text-neutral-400 text-sm">Analysis Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-neutral-400 text-sm">Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-slow">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;