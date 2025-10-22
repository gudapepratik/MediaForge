import axios from "axios"
import React, { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router"
import config from "../../config"
import WatchVideoPlayer from "../components/WatchVideoPlayer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

function WatchVideo() {
  const [searchParams] = useSearchParams()
  const [video, setVideo] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const v = searchParams.get("v")
    if (!v) {
      setTimeout(() => navigate("/"), 3000)
    } else {
      fetchVideo(v)
    }
  }, [searchParams, navigate])

  const fetchVideo = async (videoId) => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${config.BACKEND_ENDPOINT}/api/videos/get-video/${videoId}`)
      setVideo(data?.data?.video)
    } catch (error) {
      console.error("Error Loading video", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-2 md:px-4 py-4">
      {/* Video Player */}
      <div className="aspect-video w-full rounded-xl overflow-hidden bg-zinc-900">
        <WatchVideoPlayer
          thumbnail={video?.thumbnail}
          videoUrl={`${config.R2_PUBLIC_URL}/${video?.storageKey}`}
        />
      </div>

      <div className="mt-4 space-y-3 text-foreground">
        {/* Title */}
        {loading ? (
          <Skeleton className="h-6 w-3/4" />
        ) : (
          <h1 className="text-lg md:text-xl font-semibold text-foreground">{video?.title || "Sample Video Title"}</h1>
        )}

        {/* User Info */}
        <div className="flex items-center gap-3">
          {loading ? (
            <>
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </>
          ) : (
            <>
              <Avatar className="w-10 h-10">
                <AvatarImage src={video?.user?.avatar || "/default-avatar.png"} alt={video?.user?.name} />
                <AvatarFallback>{video?.user?.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-zinc-100 ">{video?.user?.name || "John Doe"}</span>
                <span className="text-xs text-zinc-400">12.3K subscribers</span>
              </div>
            </>
          )}
        </div>

        <Separator className="bg-zinc-800" />

        {/* Description */}
        {loading ? (
          <>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </>
        ) : (
          <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
            {video?.description ||
              "This is the description of the video. It provides insights, details, and context about what this video is all about."}
          </p>
        )}
      </div>
    </div>
  )
}

export default WatchVideo
