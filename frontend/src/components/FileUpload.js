import React, { useState, useRef, useCallback } from 'react';

const FileUpload = ({ onAnalysisComplete, onError, onLoading }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [childAge, setChildAge] = useState(8);
  const [dragActive, setDragActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [mode, setMode] = useState('upload'); // 'upload' or 'record'

  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const allowedExtensions = ['.wav', '.mp3', '.m4a', '.flac', '.ogg', '.webm'];
  const maxFileSize = 50 * 1024 * 1024; // 50MB

  const validateFile = (file) => {
    if (!file) return 'No file selected';

    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      return `Unsupported file type. Allowed: ${allowedExtensions.join(', ')}`;
    }

    if (file.size > maxFileSize) {
      return 'File size too large. Maximum 50MB allowed.';
    }

    return null;
  };

  const startRecording = useCallback(async () => {
    console.log('startRecording called');
    try {
      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone access granted');
      streamRef.current = stream;
      chunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorder.ondataavailable = (event) => {
        console.log('Data available, size:', event.data.size);
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('Recording stopped, creating blob...');
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `recording_${Date.now()}.webm`, { type: 'audio/webm' });
        console.log('Recording file created:', file.name, 'Size:', file.size);
        setRecordedBlob(blob);
        setSelectedFile(file);
        setRecordingTime(0);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      console.log('Recording started');

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      onError('Could not access microphone. Please check permissions.');
    }
  }, [onError]);

  const stopRecording = useCallback(() => {
    console.log('stopRecording called');
    if (mediaRecorderRef.current && isRecording) {
      console.log('Stopping media recorder...');
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    } else {
      console.log('No active recording to stop');
    }
  }, [isRecording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileSelect = (file) => {
    console.log('handleFileSelect called with file:', file);
    const error = validateFile(file);
    if (error) {
      console.log('File validation error:', error);
      onError(error);
      return;
    }

    console.log('File selected successfully:', file.name);
    setSelectedFile(file);
    onError(null); // Clear any previous errors
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('File dropped, files:', e.dataTransfer.files);
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    } else {
      console.log('No files in drop event');
    }
  };

  const handleFileInputChange = (e) => {
    console.log('File input changed, files:', e.target.files);
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    } else {
      console.log('No file selected');
    }
  };

  const handleSubmit = async () => {
    const fileToUpload = selectedFile;
    if (!fileToUpload) {
      onError('Please select an audio file or record audio first');
      return;
    }

    onLoading(true);
    onError(null);

    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('child_age', childAge.toString());

      console.log('Sending request to:', 'http://localhost:8000/analyze');
      console.log('File:', fileToUpload.name, 'Size:', fileToUpload.size);

      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: errorText };
        }
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Analysis result:', result);
      onAnalysisComplete(result);

    } catch (error) {
      console.error('Analysis error:', error);
      onError(error.message || 'Failed to analyze audio. Please try again.');
    } finally {
      onLoading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setRecordedBlob(null);
    setRecordingTime(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Stop recording if active
    if (isRecording) {
      stopRecording();
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8">
      {/* Mode Selection */}
      <div className="flex justify-center">
        <div className="bg-neutral-100 rounded-2xl p-2 flex">
          <button
            onClick={() => {
              console.log('Upload File mode clicked');
              setMode('upload');
            }}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              mode === 'upload'
                ? 'bg-white text-black shadow-md'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            Upload File
          </button>
          <button
            onClick={() => {
              console.log('Record Audio mode clicked');
              setMode('record');
            }}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              mode === 'record'
                ? 'bg-white text-black shadow-md'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            Record Audio
          </button>
        </div>
      </div>

      {/* File Upload Area */}
      {mode === 'upload' && (
        <div
          className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 cursor-pointer ${
            dragActive
              ? 'border-accent-400 bg-accent-50 scale-105'
              : selectedFile
              ? 'border-success-400 bg-success-50'
              : 'border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={allowedExtensions.join(',')}
            onChange={handleFileInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="space-y-6">
            {selectedFile ? (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 bg-black rounded-2xl mb-6">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">{selectedFile.name}</h3>
                  <p className="text-neutral-600 mb-4">{formatFileSize(selectedFile.size)}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Remove file button clicked');
                      clearFile();
                    }}
                    className="text-neutral-500 hover:text-danger-600 transition-colors text-sm font-medium"
                  >
                    Remove file
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 bg-neutral-100 rounded-2xl mb-6">
                  <svg className="w-10 h-10 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                    Drop your audio file here
                  </h3>
                  <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                    or click to browse. We support WAV, MP3, M4A, FLAC, and OGG files up to 50MB.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 text-sm text-neutral-500">
                    {allowedExtensions.map((ext, index) => (
                      <span key={index} className="px-3 py-1 bg-neutral-100 rounded-full">
                        {ext.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Recording Area */}
      {mode === 'record' && (
        <div className="bg-neutral-50 rounded-3xl p-12 text-center">
          <div className="space-y-6">
            {selectedFile && recordedBlob ? (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 bg-black rounded-2xl mb-6">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">Recording Saved</h3>
                  <p className="text-neutral-600 mb-4">Duration: {formatTime(recordingTime)}</p>
                  <button
                    onClick={clearFile}
                    className="text-neutral-500 hover:text-danger-600 transition-colors text-sm font-medium"
                  >
                    Record Again
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 ${
                  isRecording ? 'bg-danger-500 animate-pulse' : 'bg-neutral-200'
                }`}>
                  <svg className="w-10 h-10 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                    {isRecording ? 'Recording...' : 'Click to Record'}
                  </h3>
                  {isRecording && (
                    <div className="mb-6">
                      <div className="text-3xl font-mono font-bold text-danger-600 mb-2">
                        {formatTime(recordingTime)}
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div className="bg-danger-500 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
                      </div>
                    </div>
                  )}
                  <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                    {isRecording
                      ? 'Speak clearly for at least 30 seconds. Click stop when finished.'
                      : 'Record your voice directly in the browser. Make sure to grant microphone permissions.'
                    }
                  </p>
                  <button
                    onClick={() => {
                      console.log('Record button clicked, isRecording:', isRecording);
                      if (isRecording) {
                        stopRecording();
                      } else {
                        startRecording();
                      }
                    }}
                    className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                      isRecording
                        ? 'bg-danger-500 hover:bg-danger-600 text-white animate-pulse'
                        : 'bg-black hover:bg-neutral-800 text-white'
                    }`}
                  >
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Age Selection */}
      <div className="bg-neutral-50 rounded-2xl p-8">
        <div className="max-w-md mx-auto">
          <label htmlFor="childAge" className="block text-lg font-semibold text-neutral-900 mb-4">
            Child's Age
          </label>
          <select
            id="childAge"
            value={childAge}
            onChange={(e) => setChildAge(parseInt(e.target.value))}
            className="w-full px-6 py-4 text-lg border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
          >
            {Array.from({ length: 7 }, (_, i) => i + 6).map(age => (
              <option key={age} value={age} className="text-lg">{age} years old</option>
            ))}
          </select>
          <p className="text-sm text-neutral-500 mt-3 text-center">
            Age affects analysis parameters and reading expectations
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="text-center">
        <button
          onClick={() => {
            console.log('Test button clicked - basic functionality works');
            alert('Button is working! Check console for logs.');
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-4"
        >
          Test Button
        </button>
        <button
          onClick={() => {
            console.log('Analyze button clicked');
            handleSubmit();
          }}
          disabled={!selectedFile}
          className={`px-12 py-5 rounded-2xl font-bold text-lg uppercase tracking-wider transition-all duration-300 transform ${
            selectedFile
              ? 'bg-black text-white hover:bg-neutral-800 hover:scale-105 shadow-large hover:shadow-xl'
              : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
          }`}
        >
          {selectedFile ? 'Analyze Speech' : mode === 'upload' ? 'Select File First' : 'Record Audio First'}
        </button>
      </div>
    </div>
  );
};

export default FileUpload;