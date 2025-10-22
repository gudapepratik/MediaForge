import React from "react"
import { useUpload } from "../Hooks/useUpload"
import UploadCard from "./UploadCard"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function UploadsContainer() {
  const { uploads, isLoading } = useUpload()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            className="p-2 rounded-lg bg-card text-card-foreground shadow-sm"
          >
            <div className="flex flex-col gap-3">
              <Skeleton className="h-20 w-full rounded-md" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/2 " />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (!uploads || uploads.length === 0) {
    return (
      <Card className="p-8 text-center border border-muted bg-card text-muted-foreground rounded-lg shadow-sm">
        No uploads found. Start uploading your videos!
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-all">
      {uploads.map((u) => (
        <UploadCard key={u.videoId} meta={u} />
      ))}
    </div>
  )
}
