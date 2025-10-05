import React, { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js/dist/hls.js'
import 'media-chrome'

function VideoPlayer({videoUrl, title = null, thumbnail = null}) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [qualities, setQualities] = useState([]);
  const [currentQuality, setCurrentQuality] = useState(-1);
  const [playbackRates] = useState([0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]);
  const [currentRate, setCurrentRate] = useState(1);


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
    <div className="w-full max-w-6xl mx-auto">
      {/* Title */}
      {title && (
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>
      )}

      {/* Media Chrome Player */}
      <media-controller className="w-full">
        <video
          ref={videoRef}
          slot="media"
          // poster={thumbnail}
          crossOrigin="anonymous"
          className="w-full"
        />

        {/* Custom Controls Layout */}
        <media-control-bar className="bg-gradient-to-t from-black to-transparent">
          {/* Progress Bar */}
          <media-time-range className="w-full"></media-time-range>
        </media-control-bar>

        <media-control-bar className="bg-black bg-opacity-90">
          {/* Left Side Controls */}
          <media-play-button className="text-white hover:text-red-500"></media-play-button>
          <media-seek-backward-button seek-offset="10" className="text-white hover:text-red-500"></media-seek-backward-button>
          <media-seek-forward-button seek-offset="10" className="text-white hover:text-red-500"></media-seek-forward-button>
          <media-mute-button className="text-white hover:text-red-500"></media-mute-button>
          <media-volume-range className="w-24"></media-volume-range>
          <media-time-display show-duration className="text-white text-sm"></media-time-display>

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
          --media-range-track-height: 5px;
          --media-range-thumb-height: 14px;
          --media-range-thumb-width: 14px;
          margin-bottom: 8px;
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