import { useState, useEffect } from "react"
import { useUpload } from "../Hooks/useUpload"
import { useUploadProgress } from "../Hooks/useUploadProgress"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card"
import { Progress } from "./ui/progress"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Pause, Play, X } from "lucide-react"

export default function UploadCard({ meta }) {
  const { pauseUpload, resumeUpload, cancelUpload } = useUpload()
  const { progress, updateMessage } =
    meta.status === "transcoding"
      ? useUploadProgress()
      : { progress: 0, updateMessage: null }

  const [localFile, setLocalFile] = useState(null)
  const [awaitingFileSelection, setAwaitingFileSelection] = useState(false)

  const handlePauseResume = async () => {
    try {
      if (meta.status === "uploading") {
        await pauseUpload(meta.videoId)
      } else if (meta.status === "paused") {
        if (!localFile) {
          setAwaitingFileSelection(true)
          document.getElementById(`file-${meta.videoId}`)?.click()
          return
        }
        await resumeUpload(meta.videoId, localFile)
      }
    } catch (error) {
      console.error(error)
      alert(error?.message)
      setLocalFile(null)
    }
  }

  const onFilePick = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setLocalFile(f)

    if (awaitingFileSelection) {
      setAwaitingFileSelection(false)
      try {
        await resumeUpload(meta.videoId, f)
      } catch (error) {
        console.error(error)
        alert(error?.message)
        setLocalFile(null)
      }
    }
  }

  const getStatusBadge = () => {
    const colorMap = {
      uploading: "text-blue-500 border-blue-500",
      paused: "text-amber-500 border-amber-500",
      completed: "text-green-500 border-green-500",
      failed: "text-red-500 border-red-500",
      aborted: "text-muted-foreground border-border",
      transcoding: "text-purple-500 border-purple-500",
      default: "text-muted-foreground border-border",
    }
    const colorClass = colorMap[meta.status] || colorMap.default
    const label = meta.status.charAt(0).toUpperCase() + meta.status.slice(1)
    return <Badge variant="outline" className={colorClass}>{label}</Badge>
  }

  const isActionable = meta.status === "uploading" || meta.status === "paused"
  const showProgress =
    meta.status !== "completed" &&
    meta.status !== "failed" &&
    meta.status !== "aborted"

  return (
    <Card className="w-full bg-card text-card-foreground border border-border rounded-xl overflow-hidden hover:shadow-md transition">
      <input
        id={`file-${meta.videoId}`}
        type="file"
        className="hidden"
        onChange={onFilePick}
        accept="video/*"
      />

      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        {/* Thumbnail */}
        <div className="w-28 h-16 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
          {meta.thumbnail ? (
            <img
              src={meta.thumbnail}
              alt="thumbnail"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm text-muted-foreground">No Thumbnail</span>
          )}
        </div>

        {/* Title + File Info */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <CardTitle className="text-base truncate">
            {meta.title || meta.fileName}
          </CardTitle>
          <p className="text-xs text-muted-foreground truncate">
            {(meta.fileSize / (1024 * 1024)).toFixed(2)} MB
          </p>
        </div>

        {/* Status Badge */}
        {getStatusBadge()}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Progress */}
        {showProgress && (
          <div className="space-y-1">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{updateMessage || "Processing..."}</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
          </div>
        )}

        {/* Actions */}
        {isActionable && (
          <div className="flex items-center justify-end gap-2">
            <Button
              size="icon"
              variant="outline"
              className="border-border text-foreground hover:bg-muted"
              onClick={handlePauseResume}
            >
              {meta.status === "uploading" ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="border-border text-destructive hover:bg-muted"
              onClick={() => cancelUpload(meta.videoId)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
