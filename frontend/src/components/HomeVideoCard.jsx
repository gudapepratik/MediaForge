import React, { useRef, useState } from 'react'
import { DummyMaleAvatarImage } from '../assets/images/imageAssets'
import { Skeleton } from './ui/skeleton';
import HomeVideoPlayer from './HomeVideoPlayer';
import { useNavigate } from 'react-router';

function HomeVideoCard({videoId, thumbnail, videoUrl, avatar, title = "This is video title", views = 0, uploadedAt = new Date()}) {
  const [isOnVideo, setIsOnVideo] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const hoverTimeoutRef = useRef(null);
  const navigate = useNavigate();

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

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => setIsOnVideo(true), 600); // 600 ms delay
  }

  const handleMouseLeave = () => {
    setIsOnVideo(false);
    clearTimeout(hoverTimeoutRef.current);
  }

  const handleNavigateToVideo = () => {
    navigate(`/watch?v=${videoId}`)
  }

  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={handleNavigateToVideo} className="w-full max-w-sm -md:max-w-md lg:max-w-lg flex hover:cursor-pointer flex-col space-y-3 font-satoshi">
      {/* TOP - Thumbnail  */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-zinc-900">
        <HomeVideoPlayer
          isOnVideo={isOnVideo}
          setIsLoaded={setIsLoaded}
          thumbnail={thumbnail}
          videoUrl={videoUrl}
        />
        {!isOnVideo && (
          <img
            src={thumbnail || 'https://marketplace.canva.com/EAFSv6o6beQ/2/0/1600w/canva-red-bold-finance-youtube-thumbnail-vGSnQGShz3c.jpg'}
            alt="video thumbnail"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {!isLoaded && isOnVideo && (
          <Skeleton className="absolute inset-0 w-full h-full" />
        )}
      </div>

      {/* BOTTOM  */}
      <div className="flex gap-3 px-1 items-start">
        {/* AVATAR */}
        <img src={avatar || DummyMaleAvatarImage} className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"/>
        {/* TITLE AND VIEWS  */}
        <div className="flex-1 ">
          <h2 className="text-sm md:text-lg font-bold text-zinc-800 dark:text-foreground  ">{title}</h2>
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