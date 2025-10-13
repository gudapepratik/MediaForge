import React, { useRef, useState } from 'react'
import { DummyMaleAvatarImage } from '../assets/images/imageAssets'
import { Skeleton } from './ui/skeleton';
import HomeVideoPlayer from './HomeVideoPlayer';

function HomeVideoCard({thumbnail, videoUrl, avatar, title = "This is video title", views = 0, uploadedAt = new Date()}) {
  const [isOnVideo, setIsOnVideo] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const hoverTimeoutRef = useRef(null);

  const transformViews = (views) => {
    if (views < 1000) return `${views} views`;
    if (views < 1_000_000) return `${(views / 1000).toFixed(1)}K views`;
    return `${(views / 1_000_000).toFixed(1)}M views`;
  }

  const transformDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  useState(() => {
    console.log(isOnVideo ? "showing video" : "removing video")
  }, [isOnVideo])

  let hoverTimeout;
  const handleMouseEnter = () => {
    hoverTimeout.current = setTimeout(() => setIsOnVideo(true), 1000); // 2 secs delay
  }

  const handleMouseLeave = () => {
    setIsOnVideo(false);
    clearTimeout(hoverTimeout.current);
  }

  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="w-full max-w-sm -md:maxw-md lg:max-w-lg flex flex-col space-y-3 font-satoshi">
      {/* TOP - Thumbnail  */}
      <div className="w-full aspect-video rounded-xl overflow-hidden">
        {/* {!isOnVideo ? (
          (thumbnail ? (
            <img src={thumbnail} alt="video thumbnail" />
          ): (
            <Skeleton className={"w-full aspect-video"}/>
          ))
        ): (
          <HomeVideoPlayer isOnVideo={isOnVideo} />
        )} */}

        {/* {isOnVideo && (
          (isLoaded ? (
            <HomeVideoPlayer isOnVideo={isOnVideo} setIsLoaded={setIsLoaded}/>
            ): (
              <Skeleton className={"w-full aspect-video"}/>
              ))
              )} */}
        <HomeVideoPlayer isOnVideo={isOnVideo} setIsLoaded={setIsLoaded} thumbnail={thumbnail} videoUrl={videoUrl}/>


        {!isOnVideo && (
          <img src={thumbnail || 'https://marketplace.canva.com/EAFSv6o6beQ/2/0/1600w/canva-red-bold-finance-youtube-thumbnail-vGSnQGShz3c.jpg'} alt="video thumbnail"/>
        )}

        {!isLoaded && isOnVideo && (
          <Skeleton className="absolute inset-0 w-full h-full aspect-video" />
        )}
      </div>

      {/* BOTTOM  */}
      <div className="flex gap-3 px-1 items-start">
        {/* AVATAR */}
        <img src={avatar || DummyMaleAvatarImage} className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"/>
        {/* TITLE AND VIEWS  */}
        <div className="flex-1 ">
          <h2 className="text-sm md:text-lg font-bold">{title}</h2>
          <div className="text-xs text-zinc-400 flex items-center gap-1 ">
            <p>{transformViews(views)}</p>
            <p>{transformDate(uploadedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomeVideoCard