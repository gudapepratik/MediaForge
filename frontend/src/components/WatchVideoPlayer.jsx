import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js/dist/hls.js";
import "media-chrome";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  Maximize,
  Minimize,
  RotateCw,
  RotateCcw,
  PictureInPicture2,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

function WatchVideoPlayer({ thumbnail, videoUrl }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [qualities, setQualities] = useState([]);
  const [currentQuality, setCurrentQuality] = useState(-1);
  const [playbackRates] = useState([0.5, 1, 1.25, 1.5, 2]);
  const [currentRate, setCurrentRate] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showVolume, setShowVolume] = useState(false);
  const [settingsView, setSettingsView] = useState("main"); // main | playback | quality

  // HLS Setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength: 30,
        startLevel: -1,
        enableWorker: true,
      });

      hls.loadSource(videoUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        const levels = data.levels.map((level, i) => ({
          id: i,
          label: `${level.height}p`,
        }));
        setQualities([{ id: -1, label: "Auto" }, ...levels]);
      });

      hlsRef.current = hls;
      return () => hls.destroy();
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoUrl;
    }
  }, [videoUrl]);

  // Video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", updateDuration);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", updateDuration);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, []);

  // Controls
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    isPlaying ? v.pause() : v.play();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  };

  const skip = (sec) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime += sec;
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current.parentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const changePlaybackRate = (rate) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setCurrentRate(rate);
    }
  };

  const changeQuality = (id) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = id;
      setCurrentQuality(id);
    }
  };

  const handlePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.error("PiP not supported:", err);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    console.log(settingsView)
  }, [settingsView])

  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden aspect-video max-h-[80vh]">
      <media-controller class="absolute inset-0">
        <video
          ref={videoRef}
          slot="media"
          poster={thumbnail}
          crossOrigin="anonymous"
          className="w-full h-full object-contain"
        />

        {/* Center Controls */}
        <div className="absolute inset-0 flex items-center justify-center space-x-8 opacity-0 hover:opacity-100 transition-opacity">
          <Button size="icon" variant="ghost" className="text-white" onClick={() => skip(-10)}>
            <RotateCcw className="w-6 h-6" />
          </Button>
          <Button size="icon" variant="ghost" className="bg-black/40 text-white rounded-full p-6" onClick={togglePlay}>
            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
          </Button>
          <Button size="icon" variant="ghost" className="text-white" onClick={() => skip(10)}>
            <RotateCw className="w-6 h-6" />
          </Button>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-12 z-10 left-0 right-0 scale-[102%]">
          <media-time-range class="w-full h-1 bg-gray-600 rounded-full cursor-pointer"></media-time-range>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1 md:gap-3">
            <Button size="icon" variant="ghost" className="text-white" onClick={togglePlay}>
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>

            {/* Volume button + slider (horizontal expand) */}
            <div
              className="relative flex items-center"
              onMouseEnter={() => setShowVolume(true)}
              onMouseLeave={() => setShowVolume(false)}
            >
              <Button size="icon" variant="ghost" className="text-white" onClick={toggleMute}>
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              {showVolume && (
                <media-volume-range
                  class="relative w-24 h-1 cursor-pointer"
                ></media-volume-range>
              )}
            </div>

            <span className="text-sm">{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Settings dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Settings className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-zinc-900 text-white border-none w-40">
                {settingsView === "main" && (
                  <>
                    <DropdownMenuItem onClick={() => setSettingsView("playback")}>Playback Speed</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSettingsView("quality")}>Quality</DropdownMenuItem>
                  </>
                )}

                {settingsView === "playback" && (
                  <>
                    {playbackRates.map((rate) => (
                      <DropdownMenuItem key={rate} onClick={() => changePlaybackRate(rate)}>
                        {rate}x {currentRate === rate && "✓"}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuItem onClick={() => setSettingsView("main")}>← Back</DropdownMenuItem>
                  </>
                )}

                {settingsView === "quality" && (
                  <>
                    {qualities.map((q) => (
                      <DropdownMenuItem key={q.id} onClick={() => changeQuality(q.id)}>
                        {q.label} {currentQuality === q.id && "✓"}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuItem onClick={() => setSettingsView("main")}>← Back</DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button size="icon" variant="ghost" className="text-white" onClick={toggleFullScreen}>
              {isFullScreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </Button>

            <Button size="icon" variant="ghost" className="text-white" onClick={handlePiP}>
              <PictureInPicture2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </media-controller>
    </div>
  );
}

export default WatchVideoPlayer;
