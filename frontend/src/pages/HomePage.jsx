import { useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, Camera, ArrowRight, ImagePlus } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } },
};

function HomePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFile = useCallback(
    (file) => {
      if (!file || !file.type.startsWith('image/')) return;
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    },
    []
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      handleFile(file);
    },
    [handleFile]
  );

  const handleAnalyze = () => {
    if (!selectedFile) return;
    navigate('/analysis', { state: { imageFile: selectedFile, preview } });
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
    >
      {/* Hero */}
      <motion.div variants={item} className="text-center mb-12 sm:mb-16">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
          <span className="gradient-text">AI Plant Disease</span>
          <br />
          <span className="text-white">Detective</span>
        </h1>
        <p className="text-white/50 text-base sm:text-lg max-w-xl mx-auto">
          Upload or capture a leaf image to detect plant diseases.
          Get voice-powered insights and treatment advice.
        </p>
      </motion.div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
        {/* Upload Card */}
        <motion.div
          variants={item}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="relative"
        >
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`glass-hover cursor-pointer p-8 sm:p-10 text-center transition-all duration-300 ${
              isDragOver
                ? 'border-accent-purple/60 bg-accent-purple/10 scale-[1.02]'
                : ''
            }`}
            role="button"
            tabIndex={0}
            aria-label="Upload image"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
            }}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-2xl bg-accent-purple/10">
                <Upload className="w-8 h-8 text-accent-purple" />
              </div>
              <div>
                <p className="text-white/90 font-medium mb-1">Upload Image</p>
                <p className="text-white/40 text-sm">
                  Drag & drop or click to browse
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/30">
                <ImagePlus className="w-3.5 h-3.5" />
                <span>JPG, PNG, WebP</span>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>
        </motion.div>

        {/* Camera Card */}
        <motion.div
          variants={item}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div
            onClick={() => cameraInputRef.current?.click()}
            className="glass-hover cursor-pointer p-8 sm:p-10 text-center h-full"
            role="button"
            tabIndex={0}
            aria-label="Capture image from camera"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') cameraInputRef.current?.click();
            }}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-2xl bg-accent-deep/10">
                <Camera className="w-8 h-8 text-accent-violet" />
              </div>
              <div>
                <p className="text-white/90 font-medium mb-1">Capture Photo</p>
                <p className="text-white/40 text-sm">
                  Take a photo with your camera
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/30">
                <Camera className="w-3.5 h-3.5" />
                <span>Opens device camera</span>
              </div>
            </div>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>
        </motion.div>
      </div>

      {/* Preview + Analyze */}
      {preview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="glass p-2 glow-purple">
            <img
              src={preview}
              alt="Selected leaf"
              className="rounded-xl max-h-48 object-cover"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAnalyze}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-purple hover:bg-accent-deep text-white font-medium transition-colors"
          >
            Analyze Disease
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}

export default HomePage;
