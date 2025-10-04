import React from "react";
import { useEffect } from "react";
import { useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

function VideoCard({ video = null, options, onReady }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if(!playerRef.current) {
      const videoElement = document.createElement('video-js')
      videoElement.classList.add('vjs-big-play-centered')
      videoRef.current.appendChild(videoElement);

      const player = (playerRef.current = videojs(videoElement, options, () => {
        videojs.log('player is ready');
        if (onReady) {
          onReady(player);
        }
      }));
    } else{
      const player = playerRef.current;
      player.autoplay(options.autoplay);
      player.src(options.sources);
    }
    
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [options, onReady]);

  return (
    // <div className="max-w-sm rounded-2xl overflow-hidden bg-zinc-100 hover:shadow-lg transition p-2">
    //   {/* Thumbnail */}
    //   <div className="relative">
    //     <img
    //       src={data?.thumbnail || "https://ralfvanveen.com/wp-content/uploads/2021/06/Placeholder-_-Begrippenlijst.svg"}
    //       alt={data?.title}
    //       className="w-full rounded-lg"
    //     />
    //     <span className="absolute bottom-2 right-2 bg-black bg-opacity-10 text-white text-xs px-1.5 py-0.5 rounded">
    //       {data?.duration}
    //     </span>
    //   </div>

    //   {/* Video Info */}
    //   <div className="flex mt-3">
    //     {/* Channel Avatar */}
    //     <img
    //       src="https://ralfvanveen.com/wp-content/uploads/2021/06/Placeholder-_-Begrippenlijst.svg"
    //       alt={data?.channel}
    //       className="w-10 h-10 rounded-full"
    //     />

    //     {/* Title & Channel */}
    //     <div className="ml-3">
    //       <h3 className="text-sm font-semibold line-clamp-2">{data?.title}</h3>
    //       <p className="text-xs text-gray-600">{data?.channel}</p>
    //       <p className="text-xs text-gray-500">
    //         {data?.views} views • {data?.uploaded}
    //       </p>
    //     </div>
    //   </div>
    // </div>
    <div className='video-player' data-vjs-player>
      <div ref={videoRef} />
    </div>
  );
}

export default VideoCard;
