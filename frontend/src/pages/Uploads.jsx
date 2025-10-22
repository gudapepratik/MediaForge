import React, { useState, useEffect } from "react"
import { useSearchParams } from "react-router"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Skeleton } from "@/components/ui/skeleton"
import UploadsContainer from "../components/UploadsContainer"
import TranscodesContainer from "../components/TranscodesContainer"

export default function Uploads() {
  const [view, setView] = useState("uploads") // 'uploads' or 'transcodes'
  const [isLoading, setIsLoading] = useState(false)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const currentView = searchParams.get("view")
    if (currentView === "transcodes") setView("transcodes")
  }, [searchParams])

  return (
    <div className="min-h-screen w-full bg-background text-foreground transition-colors duration-300">
      <div className="mx-auto p-4 md:p-5">
        <Card className="bg-card text-card-foreground shadow-sm border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-semibold hidden sm:block">Uploads Dashboard</CardTitle>
            {/* Toggle between uploads and transcodes */}
            <ToggleGroup
              type="single"
              value={view}
              onValueChange={(val) => val && setView(val)}
              className="flex gap-2"
            >
              <ToggleGroupItem
                value="uploads"
                aria-label="Show pending uploads"
                className="px-4 py-2 rounded-md text-sm data-[state=on]:bg-primary data-[state=on]:text-primary-foreground transition-colors"
              >
                Uploads
              </ToggleGroupItem>
              <ToggleGroupItem
                value="transcodes"
                aria-label="Show pending transcodes"
                className="px-4 py-2 rounded-md text-sm data-[state=on]:bg-primary data-[state=on]:text-primary-foreground transition-colors"
              >
                Transcodes
              </ToggleGroupItem>
            </ToggleGroup>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full rounded-md" />
                <Skeleton className="h-24 w-full rounded-md" />
                <Skeleton className="h-24 w-full rounded-md" />
              </div>
            ) : view === "uploads" ? (
              <UploadsContainer />
            ) : (
              <TranscodesContainer />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
