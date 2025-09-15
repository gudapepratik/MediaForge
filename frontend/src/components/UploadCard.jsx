import { useState } from "react"
import { useUpload } from "../Hooks/useUpload"

export default function UploadCard({ meta }) {
  const { pauseUpload, resumeUpload, cancelUpload } = useUpload()
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

  const getStatusIcon = () => {
    switch (meta.status) {
      case "uploading":
        return (
          <div className="h-6 w-6 text-blue-500 animate-pulse">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
          </div>
        )
      case "paused":
        return (
          <div className="h-6 w-6 text-amber-500">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M14,19H18V5H14M6,19H10V5H6V19Z" />
            </svg>
          </div>
        )
      case "completed":
        return (
          <div className="h-6 w-6 text-green-500">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z" />
            </svg>
          </div>
        )
      case "failed":
        return (
          <div className="h-6 w-6 text-red-500">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z" />
            </svg>
          </div>
        )
      case "aborted":
        return (
          <div className="h-6 w-6 text-gray-500">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="h-6 w-6 text-gray-400">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
          </div>
        )
    }
  }

  // Added getStatusColor function
  const getStatusColor = () => {
    switch (meta.status) {
      case "uploading":
        return "bg-blue-200"
      case "paused":
        return "bg-amber-200"
      case "completed":
        return "bg-green-200"
      case "failed":
        return "bg-red-200"
      case "aborted":
        return "bg-gray-200"
      default:
        return "bg-gray-200"
    }
  }

  const getBorderColor = () => {
    switch (meta.status) {
      case "uploading":
        return "border-blue-200"
      case "paused":
        return "border-amber-200"
      case "completed":
        return "border-green-200"
      case "failed":
        return "border-red-200"
      case "aborted":
        return "border-gray-200"
      default:
        return "border-gray-200"
    }
  }

  const isActionable = meta.status === "uploading" || meta.status === "paused"
  const showProgress = meta.status !== "completed" && meta.status !== "failed" && meta.status !== "aborted"

  return (
    <div
      className={`size-fit bg-white border-2 ${getBorderColor()} rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-6`}
    >
      <input id={`file-${meta.videoId}`} type="file" className="hidden" onChange={onFilePick} accept="video/*" />

      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="h-8 w-8 text-gray-400">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z" />
            </svg>
          </div>
        </div>
        <div className="flex items-center justify-center">{getStatusIcon()}</div>
      </div>

      <div className="flex-1 space-y-4">
        <div>
          <p className="text-lg font-medium text-gray-900 truncate" title={meta.fileName}>
            {meta.fileName}
          </p>
          <p className="text-sm text-gray-500 capitalize mt-1">{meta.status}</p>
        </div>

        {showProgress && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  meta.status === "uploading"
                    ? "bg-blue-500"
                    : meta.status === "paused"
                      ? "bg-amber-500"
                      : "bg-gray-400"
                }`}
                style={{ width: `${meta.percentage || 0}%` }}
              ></div>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-gray-600">{meta.percentage || 0}%</span>
            </div>
          </div>
        )}

        {isActionable && (
          <div className="flex gap-3">
            <button
              onClick={handlePauseResume}
              className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {meta.status === "uploading" ? (
                <div className="h-4 w-4">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,19H18V5H14M6,19H10V5H6V19Z" />
                  </svg>
                </div>
              ) : (
                <div className="h-4 w-4">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8,5.14V19.14L19,12.14L8,5.14Z" />
                  </svg>
                </div>
              )}
            </button>
            <button
              onClick={() => cancelUpload(meta.videoId)}
              className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-lg text-gray-500 hover:text-red-500 hover:bg-gray-50 transition-colors"
            >
              <div className="h-4 w-4">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                </svg>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
