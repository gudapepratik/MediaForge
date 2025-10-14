import Hls from 'hls.js/dist/hls.js';
import 'media-chrome'
import React, { useEffect, useRef, useState } from 'react'

function HomeVideoPlayer({isOnVideo,setIsLoaded, thumbnail, videoUrl = `https://pub-b462f8f0e6784b8fbdbfca6e0cd1d5cb.r2.dev/videos/cmfgvpl9i0000o30zgxo1wois/cmghvbnol0001mmcykop7w2tk/hls/master.m3u8`}) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isOnVideo || isInitialized) return;
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength: 20,
        enableWorker: true,
        startLevel: -1,
      });

      hls.loadSource(videoUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoaded(true);
        video.play();
      });

      hlsRef.current = hls;
      setIsInitialized(true);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
      video.play();
      setIsLoaded(true);
      setIsInitialized(true);
    }
  }, [isOnVideo, videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isOnVideo) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isOnVideo]);

  return (
    <div className={`relative w-full aspect-video z-10 ${isOnVideo ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <media-controller class="w-full h-full flex flex-col">
        <video
          ref={videoRef}
          slot="media"
          muted
          loop
          playsInline
          preload="metadata"
          poster={thumbnail}
          crossOrigin="anonymous"
          className={`w-full object-cover transition-opacity duration-300`}
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
                  appearance-none w-full h-full bg-[#EEEEEE] cursor-pointer
                  before:absolute before:left-0 before:top-0 before:h-full
                  before:bg-red-500 before:transition-all before:duration-300"
          ></media-time-range>
        </media-control-bar>

        <media-loading-indicator slot="centered-chrome" no-auto-hide></media-loading-indicator>
      </media-controller>
    </div>
  );
}

export default HomeVideoPlayer

