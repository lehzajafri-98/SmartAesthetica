import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";

export default function ReelCarousel({ reels = [] }){
  const containerRef = useRef();
  useEffect(()=>{
    let id;
    const el = containerRef.current;
    if (!el) return;
    let pos = 0;
    id = setInterval(()=>{
      pos += 320;
      if (pos >= el.scrollWidth) pos = 0;
      el.scrollTo({ left: pos, behavior: "smooth" });
    }, 4000);
    return ()=>clearInterval(id);
  },[]);
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h3 className="text-2xl font-semibold mb-4 title-neon">Preview Reels</h3>
      <div ref={containerRef} className="reel-carousel">
        {reels.length === 0 && <div className="text-muted">No reels found — add files under public/assets/reels/</div>}
        {reels.map((r,i)=>(
          <motion.div whileHover={{ scale:1.03 }} key={i} className="reel-card">
            <video className="reel-video" src={r} controls muted playsInline />
            <div className="reel-overlay">
              <div className="text-white text-sm">Reel #{i+1}</div>
              <div className="flex gap-2">
                <button className="px-3 py-1 rounded bg-white/10">Save</button>
                <button className="px-3 py-1 rounded bg-white/10">Share</button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
