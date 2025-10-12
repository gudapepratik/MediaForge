import React from "react";
import { Skeleton } from "../ui/skeleton";

function HomeVideoSkeleton() {
  return (
    <div className="w-full max-w-sm -md:maxw-md lg:max-w-lg flex flex-col space-y-3">
      <Skeleton className="w-full aspect-video rounded-xl" />
      <div className="flex gap-3 px-1 items-start">
        <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4 rounded-md" />
          <Skeleton className="h-4 w-1/2 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export default HomeVideoSkeleton;
