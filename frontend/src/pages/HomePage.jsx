import { useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ArrowRight, Leaf, Sparkles, X, ImagePlus } from 'lucide-react';

function HomePage() {
  const navigate = useNavigate();
  const galleryRef = useRef(null);
  const cameraRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  }, []);

  const clearImage = () => {
    setSelectedFile(null);
    setPreview(null);
    if (galleryRef.current) galleryRef.current.value = '';
    if (cameraRef.current) cameraRef.current.value = '';
  };

  const handleAnalyze = () => {
    if (!selectedFile) return;
    navigate('/analysis', { state: { imageFile: selectedFile, preview } });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 sm:px-6 py-12"
    >
      <div className="w-full max-w-sm mx-auto">

        {/* Branding */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-green/10 border border-accent-green/15 mb-5"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent-green" />
            <span className="text-xs text-accent-green font-medium">AI Plant Doctor</span>
          </motion.div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 leading-tight">
            <span className="text-white">Scan Your</span>{' '}
            <span className="gradient-text-warm">Plant</span>
          </h1>
          <p className="text-white/35 text-sm leading-relaxed">
            Take a photo or upload an image of a leaf to get an instant AI diagnosis.
          </p>
        </motion.div>

        {/* Upload area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AnimatePresence mode="wait">
            {!preview ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFile(e.dataTransfer.files[0]); }}
              >
                {/* Take Photo button — opens camera directly on mobile */}
                <div
                  onClick={() => cameraRef.current?.click()}
                  className={`card-green cursor-pointer p-8 text-center transition-all duration-300 ${
                    isDragOver ? 'border-accent-green/40 scale-[1.02]' : ''
                  }`}
                  role="button"
                  tabIndex={0}
                  aria-label="Take a photo"
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') cameraRef.current?.click(); }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <motion.div
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                      className="p-4 rounded-2xl bg-accent-green/10"
                    >
                      <Camera className="w-7 h-7 text-accent-green" />
                    </motion.div>
                    <div>
                      <p className="text-white/90 font-semibold text-base mb-0.5">Take a Photo</p>
                      <p className="text-white/30 text-sm">Open camera and capture a leaf</p>
                    </div>
                  </div>
                  {/* Camera input — opens camera on mobile */}
                  <input
                    ref={cameraRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files[0])}
                  />
                </div>

                {/* Upload from gallery — smaller, secondary */}
                <div
                  onClick={() => galleryRef.current?.click()}
                  className="card-green cursor-pointer px-5 py-4 transition-all duration-300 flex items-center gap-3"
                  role="button"
                  tabIndex={0}
                  aria-label="Upload from gallery"
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') galleryRef.current?.click(); }}
                >
                  <div className="p-2.5 rounded-xl bg-white/[0.04]">
                    <ImagePlus className="w-5 h-5 text-white/40" />
                  </div>
                  <div>
                    <p className="text-white/70 font-medium text-sm">Upload from gallery</p>
                    <p className="text-white/25 text-xs">JPG, PNG, WebP</p>
                  </div>
                  {/* Gallery input — no capture, opens file picker / gallery */}
                  <input
                    ref={galleryRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files[0])}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="relative card-green p-1.5 glow-green">
                  <img src={preview} alt="Selected leaf" className="w-full rounded-2xl object-cover max-h-[320px]" />
                  <button
                    onClick={(e) => { e.stopPropagation(); clearImage(); }}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/70 transition-colors"
                    aria-label="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAnalyze}
                  className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-semibold text-base transition-all"
                  style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)' }}
                >
                  <Leaf className="w-5 h-5 text-[#0f1a0f]" />
                  <span className="text-[#0f1a0f]">Analyze Disease</span>
                  <ArrowRight className="w-4 h-4 text-[#0f1a0f]" />
                </motion.button>

                <button
                  onClick={clearImage}
                  className="w-full text-center text-sm text-white/30 hover:text-white/50 transition-colors py-2"
                >
                  Take another photo
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default HomePage;
