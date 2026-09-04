import { useRef, useState, useCallback, useEffect } from "react";
import { Upload, Camera, Undo2, Redo2, RotateCcw, X, CircleDot, Sparkles, Scan, Maximize, ShieldCheck } from "lucide-react";
import Tilt from "react-parallax-tilt";
import { motion, AnimatePresence } from "framer-motion";

const MIN_WIDTH = 200;
const MIN_HEIGHT = 200;
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

export default function UploadBox({ onAnalyze, selectedTreatment }) {
  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [preview, setPreview] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);

  const [history, setHistory] = useState([{ preview: null, zoom: 1 }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const saveHistory = (p, z) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ preview: p, zoom: z });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    stopCamera();

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only JPG and PNG formats are supported.");
      inputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result;

      img.onload = () => {
        if (img.width < MIN_WIDTH || img.height < MIN_HEIGHT) {
          setError("Image resolution too low.");
          inputRef.current.value = "";
          return;
        }

        setPreview(reader.result);
        setZoom(1);
        saveHistory(reader.result, 1);
      };
    };

    reader.readAsDataURL(file);
  };

  const startCamera = useCallback(async () => {
    setError("");
    setCameraLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraActive(true);
      setPreview(null);

      // Wait for the video element to mount before setting srcObject
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      setError("Camera access denied. Please allow camera permissions.");
    } finally {
      setCameraLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    // Mirror the image (since we use front camera)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    setPreview(dataUrl);
    setZoom(1);
    saveHistory(dataUrl, 1);
    stopCamera();
  }, [stopCamera]);

  const undo = () => {
    if (historyIndex === 0) return;
    const prev = history[historyIndex - 1];
    setPreview(prev.preview);
    setZoom(prev.zoom);
    setHistoryIndex(historyIndex - 1);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const next = history[historyIndex + 1];
    setPreview(next.preview);
    setZoom(next.zoom);
    setHistoryIndex(historyIndex + 1);
  };

  const resetAll = () => {
    stopCamera();
    setPreview(null);
    setZoom(1);
    setError("");
    setHistory([{ preview: null, zoom: 1 }]);
    setHistoryIndex(0);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleAnalyzeClick = () => {
    if (!preview) {
      alert("Please upload an image first");
      return;
    }

    const img = new Image();
    img.src = preview;

    img.onload = () => {
      // OPTIMIZATION: Downscale massive images in-browser to prevent payload crashes (34MP -> 4MP)
      const MAX_DIM = 2000;
      let targetW = img.width;
      let targetH = img.height;
      
      if (Math.max(targetW, targetH) > MAX_DIM) {
        const scale = MAX_DIM / Math.max(targetW, targetH);
        targetW *= scale;
        targetH *= scale;
      }

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;

      const ctx = canvas.getContext("2d");

      // Apply zoom/crop
      const cropWidth = img.width / zoom;
      const cropHeight = img.height / zoom;
      const sx = (img.width - cropWidth) / 2;
      const sy = (img.height - cropHeight) / 2;

      ctx.drawImage(
        img,
        sx,
        sy,
        cropWidth,
        cropHeight,
        0,
        0,
        targetW,
        targetH
      );

      const processedImage = canvas.toDataURL("image/jpeg", 0.9); // Optimized quality

      onAnalyze({
        image: processedImage,
        treatment: selectedTreatment,
      });
    };
  };

  return (
    <section className="max-w-4xl mx-auto mt-20 px-6">
      <Tilt tiltMaxAngleX={3} tiltMaxAngleY={3} perspective={2000} scale={1.01} transitionSpeed={2000} className="w-full">
        <div className="relative p-12 rounded-[3rem] bg-white/70 backdrop-blur-3xl border border-white shadow-[0_30px_100px_-20px_rgba(168,85,247,0.2)] overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-100/40 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2" />

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-2 mb-8"
            >
              <div className="px-5 py-2 rounded-2xl bg-purple-50 border border-purple-100/50 flex items-center gap-2.5 shadow-sm">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">
                  {selectedTreatment}
                </h2>
              </div>
            </motion.div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 text-center text-red-600 font-bold bg-red-50 py-3 rounded-xl border border-red-100"
              >
                {error}
              </motion.p>
            )}

            <div className="flex justify-center gap-6 mb-10">
              <label className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-accent-gradient text-white font-black uppercase tracking-widest cursor-pointer hover:scale-105 hover:shadow-[0_15px_35px_-5px_rgba(168,85,247,0.4)] active:scale-95 transition-all duration-300 shadow-xl group">
                <Upload size={20} className="group-hover:-translate-y-1 transition-transform" />
                Upload
                <input
                  ref={inputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleFile}
                  className="hidden"
                />
              </label>

              <button
                onClick={cameraActive ? stopCamera : startCamera}
                disabled={cameraLoading}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest border transition-all duration-300 shadow-lg ${cameraActive
                  ? "border-red-500 text-red-600 bg-red-50/50 hover:bg-red-50 hover:shadow-red-500/10"
                  : "border-purple-200 text-purple-700 bg-white hover:bg-purple-50 hover:shadow-purple-500/10 hover:border-purple-300"
                  } ${cameraLoading ? "opacity-50 cursor-wait" : "active:scale-95"}`}
              >
                {cameraActive ? <X size={20} /> : <Camera size={20} />}
                {cameraLoading ? "Opening..." : cameraActive ? "Close" : "Camera"}
              </button>
            </div>

            <div className="flex justify-center mb-10">
              <div className="relative group">
                <div className="w-96 h-96 rounded-[3.5rem] overflow-hidden border-2 border-dashed border-purple-200 bg-gray-50/50 flex items-center justify-center shadow-inner relative group-hover:border-purple-400 transition-colors duration-500">

                  {/* Scanning Animation for realism */}
                  {preview && !cameraActive && (
                    <motion.div
                      animate={{ y: ["0%", "100%", "0%"] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent z-20 shadow-[0_0_15px_rgba(168,85,247,0.8)] opacity-60"
                    />
                  )}

                  {/* Camera live feed */}
                  {cameraActive && (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                      style={{ transform: "scaleX(-1)" }}
                    />
                  )}

                  {/* Static preview */}
                  {!cameraActive && !preview && (
                    <div className="flex flex-col items-center gap-4 text-gray-400 group-hover:text-purple-600 transition-colors duration-500">
                      <Scan size={60} strokeWidth={1} className="opacity-20 group-hover:opacity-40" />
                      <span className="text-sm font-bold uppercase tracking-[0.2em]">Diagnostic Input Required</span>
                    </div>
                  )}
                  {!cameraActive && preview && (
                    <img
                      src={preview}
                      alt="preview"
                      style={{ transform: `scale(${zoom})` }}
                      className="transition-transform duration-300 ease-out"
                    />
                  )}

                  {/* Overlay Corner Accents */}
                  <div className="absolute top-6 left-6 w-10 h-10 border-t-2 border-l-2 border-purple-300/40 rounded-tl-2xl pointer-events-none" />
                  <div className="absolute top-6 right-6 w-10 h-10 border-t-2 border-r-2 border-purple-300/40 rounded-tr-2xl pointer-events-none" />
                  <div className="absolute bottom-6 left-6 w-10 h-10 border-b-2 border-l-2 border-purple-300/40 rounded-bl-2xl pointer-events-none" />
                  <div className="absolute bottom-6 right-6 w-10 h-10 border-b-2 border-r-2 border-purple-300/40 rounded-br-2xl pointer-events-none" />
                </div>
              </div>
            </div>

            {/* History Control Bar */}
            <div className="flex justify-center mb-10">
              <div className="px-6 py-3 rounded-2xl bg-white shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)] border border-gray-50 flex items-center gap-6">
                <button className="text-gray-400 hover:text-purple-600 hover:scale-125 transition-all disabled:opacity-20" onClick={undo} disabled={historyIndex === 0}>
                  <Undo2 size={22} />
                </button>
                <div className="w-px h-6 bg-gray-100" />
                <button className="text-gray-400 hover:text-purple-600 hover:scale-125 transition-all" onClick={resetAll}>
                  <RotateCcw size={22} />
                </button>
                <div className="w-px h-6 bg-gray-100" />
                <button className="text-gray-400 hover:text-purple-600 hover:scale-125 transition-all disabled:opacity-20" onClick={redo} disabled={historyIndex === history.length - 1}>
                  <Redo2 size={22} />
                </button>
              </div>
            </div>

            {/* Capture button when camera is active */}
            <AnimatePresence>
              {cameraActive && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="flex justify-center mb-10"
                >
                  <button
                    onClick={capturePhoto}
                    className="flex items-center gap-3 px-10 py-5 rounded-[2rem] bg-gradient-to-r from-emerald-500 to-green-500 text-white font-black uppercase tracking-widest shadow-[0_20px_40px_-10px_rgba(16,185,129,0.4)] hover:shadow-[0_25px_50px_-10px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95 transition-all duration-300"
                  >
                    <CircleDot size={20} className="animate-pulse" />
                    Capture Diagnostic
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {!cameraActive && (
              <div className="max-w-xs mx-auto mb-12">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[11px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
                    <Maximize size={12} /> Optical Zoom
                  </label>
                  <span className="text-xs font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-100">
                    {zoom.toFixed(2)}x
                  </span>
                </div>
                <div className="relative h-10 flex items-center">
                  <div className="absolute w-full h-1.5 bg-gray-100 rounded-full" />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((zoom - 1) / 1.5) * 100}%` }}
                    className="absolute h-1.5 bg-accent-gradient rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                  />
                  <input
                    type="range"
                    min="1"
                    max="2.5"
                    step="0.01"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="absolute w-full opacity-0 cursor-pointer z-10"
                  />
                  {/* Floating Thumb representation */}
                  <motion.div
                    animate={{ left: `${((zoom - 1) / 1.5) * 100}%` }}
                    className="absolute w-5 h-5 bg-white border-4 border-purple-600 rounded-full shadow-lg pointer-events-none -ml-2.5 z-20"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col items-center gap-6">
              <button
                onClick={handleAnalyzeClick}
                disabled={cameraActive}
                className={`group relative px-14 py-5 rounded-[2rem] bg-gray-900 text-white text-xl font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 ${cameraActive ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span className="relative z-10">Initialize Analysis</span>
                <div className="absolute inset-0 bg-accent-gradient opacity-0 group-hover:opacity-100 rounded-[2rem] transition-opacity duration-300 -z-0" />
              </button>

              <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <ShieldCheck size={14} className="text-emerald-500" />
                Secured Diagnostic Environment
              </div>
            </div>
          </div>
        </div>
      </Tilt>

      <div className="mt-8 text-center">
        <span className="text-[10px] font-black text-purple-300 uppercase tracking-[0.3em] bg-purple-50/50 px-6 py-2 rounded-full border border-purple-100/30">
          Supported Formats: JPG, PNG • Max Resolution: 4K
        </span>
      </div>
    </section>
  );
}
