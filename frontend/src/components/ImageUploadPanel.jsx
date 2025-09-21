import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ImageUploadPanel.css';

const ImageUploadPanel = ({ onImageAnalyzed, isAnalyzing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }, []);

  const handleFileInput = useCallback((e) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }, []);

  const handleFile = async (file) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPG, PNG, GIF)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setError(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage({
        file,
        preview: e.target.result,
        name: file.name,
        size: file.size
      });
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!uploadedImage) return;

    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', uploadedImage.file);

      const response = await fetch('/api/parse', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setAnalysisResult(result);
      
      if (onImageAnalyzed) {
        onImageAnalyzed(result);
      }

    } catch (err) {
      console.error('Image analysis error:', err);
      setError(err.message || 'Failed to analyze image');
    }
  };

  const clearImage = () => {
    setUploadedImage(null);
    setAnalysisResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
    <div className="image-upload-panel">
      <div className="panel-header">
        <h3>
          <span className="icon">📷</span>
          Circuit Image Analysis
        </h3>
        <span className="badge">AI Powered</span>
      </div>

      <AnimatePresence>
        {!uploadedImage ? (
          <motion.div
            key="upload-zone"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="upload-content">
              <div className="upload-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h4>Upload Circuit Image</h4>
              <p>Drag & drop your circuit image here, or <span className="upload-link">browse</span></p>
              <div className="upload-formats">
                <span>Supports: JPG, PNG, GIF</span>
                <span>Max size: 10MB</span>
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="image-preview"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="image-preview"
          >
            <div className="preview-header">
              <div className="file-info">
                <span className="file-name">{uploadedImage.name}</span>
                <span className="file-size">{formatFileSize(uploadedImage.size)}</span>
              </div>
              <button className="clear-btn" onClick={clearImage} title="Remove image">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="preview-image">
              <img src={uploadedImage.preview} alt="Circuit preview" />
            </div>
            
            <div className="preview-actions">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`analyze-btn ${isAnalyzing ? 'analyzing' : ''}`}
                onClick={analyzeImage}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <div className="loading-spinner"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <span className="icon">🔍</span>
                    Analyze Circuit
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="error-message"
        >
          <span className="error-icon">⚠️</span>
          {error}
        </motion.div>
      )}

      {analysisResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="analysis-results"
        >
          <div className="results-header">
            <h4>Analysis Results</h4>
            <div className="confidence-badge">
              {Math.round((analysisResult.analysis?.confidence || 0) * 100)}% confident
            </div>
          </div>
          
          <div className="results-content">
            <div className="detection-summary">
              <div className="summary-item">
                <span className="label">Components Found:</span>
                <span className="value">{analysisResult.components?.length || 0}</span>
              </div>
              <div className="summary-item">
                <span className="label">Processing Method:</span>
                <span className="value method-badge">
                  {analysisResult.processing_method || 'Unknown'}
                </span>
              </div>
              <div className="summary-item">
                <span className="label">Quality:</span>
                <span className="value quality-badge">
                  {analysisResult.analysis?.detection_quality || 'Unknown'}
                </span>
              </div>
            </div>

            {analysisResult.components && analysisResult.components.length > 0 && (
              <div className="detected-components">
                <h5>Detected Components:</h5>
                <div className="components-list">
                  {analysisResult.components.slice(0, 8).map((component, index) => (
                    <div key={index} className="component-item">
                      <div className="component-type">{component.type}</div>
                      <div className="component-details">
                        <span className="component-name">{component.name}</span>
                        <span className="component-value">{component.value}</span>
                        <span className="component-confidence">
                          {Math.round((component.confidence || 0) * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                  {analysisResult.components.length > 8 && (
                    <div className="more-components">
                      +{analysisResult.components.length - 8} more components
                    </div>
                  )}
                </div>
              </div>
            )}

            {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
              <div className="recommendations">
                <h5>Recommendations:</h5>
                <ul>
                  {analysisResult.recommendations.slice(0, 3).map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ImageUploadPanel;