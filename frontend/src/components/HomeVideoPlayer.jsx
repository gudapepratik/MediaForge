import Hls from 'hls.js/dist/hls.js';
import 'media-chrome'
import React, { useEffect, useRef, useState } from 'react'

function HomeVideoPlayer({isOnVideo,setIsLoaded, thumbnail, videoUrl = `https://pub-b462f8f0e6784b8fbdbfca6e0cd1d5cb.r2.dev/videos/cmfgvpl9i0000o30zgxo1wois/cmghvbnol0001mmcykop7w2tk/hls/master.m3u8`}) {
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
        setIsLoaded(true);
      })

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        setCurrentQuality(data.level);
      })

      hlsRef.current = hls;

      return () => {
        hls.destroy();
        setIsLoaded(false);
      }
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
      setIsLoaded(true);
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
    <div
      className={`relative w-full aspect-video transition-opacity duration-300 ${
        isOnVideo ? 'flex' : 'hidden'
      }`}
    >
      <media-controller className="w-full h-full flex flex-col">
        <video
          ref={videoRef}
          slot="media"
          autoPlay={isOnVideo}
          loop
          playsInline
          preload="auto"
          // poster={thumbnail}
          crossOrigin="anonymous"
          className="w-full"
        />

        <div className='w-full flex justify-end'>
          <media-time-display showduration className="text-[8px] px-2 py-0 font-bold right-0 bg-zinc-800/30"></media-time-display>
        </div>

        <media-control-bar
          defaultduration="30"
          autohide="2"
          class="absolute bottom-0 left-0 w-full h-1 bg-zinc-700/30 group-hover:h-[5px] transition-all duration-300 ease-out"
        >
          {/* PROGRESS BAR */}
          <media-time-range
            class="p-0 [&_::-webkit-slider-thumb]:hidden [&_::-moz-range-thumb]:hidden
                  [&_::-webkit-slider-runnable-track]:bg-transparent
                  appearance-none w-full h-full cursor-pointer
                  before:absolute before:left-0 before:top-0 before:h-full
                  before:bg-red-500 before:transition-all before:duration-300"
          ></media-time-range>
        </media-control-bar>

        <media-loading-indicator slot="centered-chrome" no-auto-hide></media-loading-indicator>
      </media-controller>
    </div>
  )
}

export default HomeVideoPlayer