import React, { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js/dist/hls.js'
import 'media-chrome'


function VideoPlayer({videoUrl, title = null, thumbnail = null, mode = 'full'}) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [qualities, setQualities] = useState([]);
  const [currentQuality, setCurrentQuality] = useState(-1);
  const [playbackRates] = useState([0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]);
  const [currentRate, setCurrentRate] = useState(1);

  const isCompact = mode === 'compact';

  useEffect(() => {
    const video = videoRef.current;
    if(!video) return;

    if(Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength: 30,
        startLevel: -1,
        enableWorker: true,
      })
  
      hls.loadSource(videoUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        const levels = data.levels.map((level, i) => ({
          id: i,
          height: level.height,
          bitrate: level.bitrate,
          label: `${level.height}p`,
        }))

        levels.sort((a, b) => a.height - b.height)
        setQualities([{ id: -1, label: 'Auto' }, ...levels]);
      })

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        setCurrentQuality(data.level);
      })

      hlsRef.current = hls;

      return () => {
        hls.destroy();
      }
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
    }
  }, [videoUrl]);

  const changeQuality = (levelId) => {
    if(hlsRef.current) {
      hlsRef.current.currentLevel = levelId;
    }
  }

  const changePlaybackRate = (rate) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setCurrentRate(rate);
    }
  };

  const getCurrentQualityLabel = () => {
    if (currentQuality === -1) return 'Auto';
    const quality = qualities.find((q) => q.id === currentQuality);
    return quality ? quality.label : 'Auto';
  };

  return (
    <div className="w-full mx-auto">
      {/* Media Chrome Player */}
      <media-controller className="w-full bg-red-100">
        <video
          ref={videoRef}
          slot="media"
          // poster={thumbnail}
          crossOrigin="anonymous"
          className="w-full"
        />

        {/* Custom Controls Layout */}
        {!isCompact && (
          <media-control-bar defaultduration="30" autohide="2">
            {/* Progress Bar */}
            <media-time-range></media-time-range>
          </media-control-bar>
        )}

        <media-control-bar className="bg-black bg-opacity-90">
          {/* Left Side Controls */}
          <media-play-button className="text-white hover:text-red-500"></media-play-button>
          <media-seek-backward-button seek-offset="10" className="text-white hover:text-red-500"></media-seek-backward-button>
          <media-seek-forward-button seek-offset="10" className="text-white hover:text-red-500"></media-seek-forward-button>
          <media-mute-button className="text-white hover:text-red-500"></media-mute-button>
          <media-volume-range className="w-24"></media-volume-range>
          <media-time-display showduration className="text-white text-sm"></media-time-display>

          {/* Spacer to push right controls */}
          <div className="flex-grow"></div>

          {/* Right Side Controls */}
          
          {/* Quality Selector */}
          {qualities.length > 0 && (
            <div className="relative group">
              <button className="px-3 py-2 text-white text-sm font-medium hover:text-red-500 flex items-center gap-1">
                <span>{getCurrentQualityLabel()}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute bottom-full right-0 mb-2 bg-black bg-opacity-95 rounded-lg overflow-hidden min-w-[140px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="py-1">
                  {qualities.map((quality) => (
                    <button
                      key={quality.id}
                      onClick={() => changeQuality(quality.id)}
                      className={`w-full px-4 py-2 text-left text-sm text-white hover:bg-red-600 ${
                        (currentQuality === quality.id || (currentQuality === -1 && quality.id === -1))
                          ? 'bg-red-600'
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{quality.label}</span>
                        {quality.height !== 'auto' && (
                          <span className="text-xs text-gray-400 ml-2">
                            {(quality.bitrate / 1000000).toFixed(1)}M
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Speed Selector */}
          <div className="relative group">
            <button className="px-3 py-2 text-white text-sm font-medium hover:text-red-500 flex items-center gap-1">
              <span>{currentRate}x</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="absolute bottom-full right-0 mb-2 bg-black bg-opacity-95 rounded-lg overflow-hidden min-w-[120px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <div className="py-1">
                {playbackRates.map((rate) => (
                  <button
                    key={rate}
                    onClick={() => changePlaybackRate(rate)}
                    className={`w-full px-4 py-2 text-left text-sm text-white hover:bg-red-600 ${
                      currentRate === rate ? 'bg-red-600' : ''
                    }`}
                  >
                    {rate === 1 ? 'Normal' : `${rate}x`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <media-pip-button className="text-white hover:text-red-500"></media-pip-button>
          <media-fullscreen-button className="text-white hover:text-red-500"></media-fullscreen-button>
        </media-control-bar>

        {/* Loading Indicator */}
        <media-loading-indicator slot="centered-chrome" no-auto-hide></media-loading-indicator>
      </media-controller>

      <style jsx>{`
        media-controller {
          --media-primary-color: #ef4444;
          --media-secondary-color: rgba(255, 255, 255, 0.7);
          --media-control-background: rgba(0, 0, 0, 0.9);
          --media-control-hover-background: rgba(255, 255, 255, 0.1);
          --media-range-thumb-background: #ef4444;
          --media-range-track-background: rgba(255, 255, 255, 0.3);
          --media-range-bar-color: #ef4444;
          --media-time-range-buffered-color: rgba(255, 255, 255, 0.4);
          border-radius: 12px;
          overflow: hidden;
        }

        media-control-bar {
          padding: 8px 12px;
        }

        media-time-range {
          --media-control-background: transparent;
          --media-control-hover-background: transparent;
          --media-range-track-border-radius: 3px;
          --media-range-thumb-opacity: .7;
          --media-preview-time-margin: 0 0;
        }

        media-play-button,
        media-seek-backward-button,
        media-seek-forward-button,
        media-mute-button,
        media-pip-button,
        media-fullscreen-button {
          width: 40px;
          height: 40px;
          padding: 8px;
        }

        media-volume-range {
          --media-range-track-height: 4px;
        }

        media-loading-indicator {
          --media-loading-icon-width: 60px;
          --media-icon-color: #ef4444;
        }
      `}</style>
    </div>
  );
}

export default VideoPlayer

// import React, { useEffect, useRef, useState, useMemo } from "react";
// import Hls from "hls.js";
// import "media-chrome";
// import "media-chrome/menu";
// import "media-chrome/dist/media-theme-element.js"; // ✅ Ensures custom elements are defined

// function VideoPlayer({
//   videoUrl,
//   title = null,
//   thumbnail = null,
//   variant = "full",
//   className = "bg-black",
//   autoPlay = false,
//   poster = null,
// }) {
//   const videoRef = useRef(null);
//   const hlsRef = useRef(null);

//   const [qualities, setQualities] = useState([]);
//   const [currentQuality, setCurrentQuality] = useState(-1);
//   const [playbackRates] = useState([0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]);
//   const [currentRate, setCurrentRate] = useState(1);

//   const isCompact = variant === "compact";

//   // Initialize HLS
//   useEffect(() => {
//     const video = videoRef.current;
//     if (!video) return;

//     setQualities([]);
//     setCurrentQuality(-1);
//     setCurrentRate(1);
//     video.playbackRate = 1;

//     if (Hls.isSupported()) {
//       const hls = new Hls({
//         maxBufferLength: 30,
//         startLevel: -1,
//         enableWorker: true,
//         lowLatencyMode: true,
//       });

//       hlsRef.current = hls;
//       hls.loadSource(videoUrl);
//       hls.attachMedia(video);

//       hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
//         const levels =
//           data?.levels?.map((level, i) => ({
//             id: i,
//             height: level.height,
//             bitrate: level.bitrate,
//             label: level.height
//               ? `${level.height}p`
//               : `${Math.round(level.bitrate / 1000)}kbps`,
//           })) || [];

//         levels.sort((a, b) => (a.height || 0) - (b.height || 0));
//         setQualities([{ id: -1, label: "Auto" }, ...levels]);
//       });

//       hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
//         setCurrentQuality(typeof data?.level === "number" ? data.level : -1);
//       });

//       return () => {
//         hls.destroy();
//         hlsRef.current = null;
//       };
//     } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
//       video.src = videoUrl;
//     } else {
//       video.src = videoUrl;
//     }
//   }, [videoUrl]);

//   const changeQuality = (levelId) => {
//     if (hlsRef.current) {
//       hlsRef.current.currentLevel = levelId;
//       setCurrentQuality(levelId);
//     }
//   };

//   const changePlaybackRate = (rate) => {
//     if (videoRef.current) {
//       videoRef.current.playbackRate = rate;
//       setCurrentRate(rate);
//     }
//   };

//   const currentQualityLabel = useMemo(() => {
//     if (currentQuality === -1) return "Auto";
//     const q = qualities.find((q) => q.id === currentQuality);
//     return q?.label || "Auto";
//   }, [currentQuality, qualities]);

//   return (
//     <div className={`w-full ${className}`}>
//       <media-controller
//         class="block w-full rounded-lg overflow-hidden"
//         style={{
//           "--media-primary-color": "#3b82f6",
//           "--media-control-background": "rgba(0,0,0,0.9)",
//           "--media-control-hover-background": "rgba(255,255,255,0.08)",
//           "--media-range-thumb-background": "#3b82f6",
//           "--media-range-track-background": "rgba(255,255,255,0.25)",
//           "--media-range-bar-color": "#3b82f6",
//           "--media-time-range-buffered-color": "rgba(255,255,255,0.4)",
//           display: "block",
//           width: "100%",
//         }}
//       >
//         {/* ✅ Fixed aspect ratio using padding trick (16:9) */}
//         <div className="relative w-full bg-black" style={{ paddingTop: "56.25%" }}>
//           <video
//             ref={videoRef}
//             slot="media"
//             className="absolute top-0 left-0 w-full h-full object-contain"
//             playsInline
//             crossOrigin="anonymous"
//             poster={poster || thumbnail || undefined}
//             autoPlay={autoPlay}
//             controls={false}
//           />
//         </div>

//         {/* Top progress bar */}
//         {!isCompact && (
//           <media-control-bar
//             defaultduration="30"
//             autohide="2"
//             class="w-full bg-gradient-to-t from-black/80 to-transparent px-3 pt-1 pb-0"
//           >
//             <media-time-range class="w-full"></media-time-range>
//           </media-control-bar>
//         )}

//         {/* Bottom control bar */}
//         <media-control-bar class={isCompact ? "bg-black/80 px-2" : "bg-black/90 px-3"}>
//           {/* Left controls */}
//           <div className="flex items-center gap-1">
//             <media-play-button class="text-white w-9 h-9 p-2 hover:text-blue-500"></media-play-button>
//             {!isCompact && (
//               <>
//                 <media-seek-backward-button
//                   seek-offset="30"
//                   class="text-white w-9 h-9 p-2 hover:text-blue-500"
//                 ></media-seek-backward-button>
//                 <media-seek-forward-button
//                   seek-offset="30"
//                   class="text-white w-9 h-9 p-2 hover:text-blue-500"
//                 ></media-seek-forward-button>
//               </>
//             )}
//             <media-mute-button class="text-white w-9 h-9 p-2 hover:text-blue-500"></media-mute-button>
//             {!isCompact && <media-volume-range class="w-24"></media-volume-range>}
//             <media-time-display showduration class="text-white text-xs md:text-sm ml-1"></media-time-display>
//           </div>

//           <div className="flex-grow" />

//           {/* Right controls */}
//           <div className="flex items-center gap-1">
//             {/* Quality selector */}
//             {!isCompact && qualities.length > 0 && (
//               <div className="relative group">
//                 <button className="px-2 py-1.5 text-white text-xs md:text-sm font-medium hover:text-blue-400 flex items-center gap-1">
//                   <span>{currentQualityLabel}</span>
//                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                   </svg>
//                 </button>
//                 <div className="absolute bottom-full right-0 mb-2 bg-black/95 rounded-md overflow-hidden min-w-[140px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
//                   <div className="py-1">
//                     {qualities.map((q) => (
//                       <button
//                         key={q.id}
//                         onClick={() => changeQuality(q.id)}
//                         className={`w-full px-3 py-2 text-left text-sm text-white hover:bg-blue-600/70 ${
//                           currentQuality === q.id ? "bg-blue-600/70" : ""
//                         }`}
//                       >
//                         {q.label}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Playback speed */}
//             {!isCompact && (
//               <div className="relative group">
//                 <button className="px-2 py-1.5 text-white text-xs md:text-sm font-medium hover:text-blue-400 flex items-center gap-1">
//                   <span>{currentRate}x</span>
//                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                   </svg>
//                 </button>
//                 <div className="absolute bottom-full right-0 mb-2 bg-black/95 rounded-md overflow-hidden min-w-[120px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
//                   <div className="py-1">
//                     {playbackRates.map((rate) => (
//                       <button
//                         key={rate}
//                         onClick={() => changePlaybackRate(rate)}
//                         className={`w-full px-3 py-2 text-left text-sm text-white hover:bg-blue-600/70 ${
//                           currentRate === rate ? "bg-blue-600/70" : ""
//                         }`}
//                       >
//                         {rate === 1 ? "Normal" : `${rate}x`}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* PiP + fullscreen */}
//             {!isCompact && (
//               <media-pip-button class="text-white w-9 h-9 p-2 hover:text-blue-500"></media-pip-button>
//             )}
//             <media-fullscreen-button class="text-white w-9 h-9 p-2 hover:text-blue-500"></media-fullscreen-button>
//           </div>
//         </media-control-bar>

//         {/* Center loading */}
//         <media-loading-indicator slot="centered-chrome" no-auto-hide></media-loading-indicator>
//       </media-controller>
//     </div>
//   );
// }

// export default VideoPlayer;
