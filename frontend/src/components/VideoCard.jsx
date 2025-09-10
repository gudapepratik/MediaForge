import React from "react";

function VideoCard({ video = null }) {
  const videodummy = {
    thumbnail:
      "https://i.ytimg.com/vi/ysz5S6PUM-U/maxresdefault.jpg",
    title: "This is the video title for testing purposes",
    channel: "Dummy Channel",
    duration: "12:34",
    views: "1.2M",
    uploaded: "2 days ago",
  };

  const data = video || videodummy;

  return (
    <div className="max-w-sm rounded-2xl overflow-hidden bg-zinc-100 hover:shadow-lg transition p-2">
      {/* Thumbnail */}
      <div className="relative">
        <img
          src={data?.thumbnail || "https://ralfvanveen.com/wp-content/uploads/2021/06/Placeholder-_-Begrippenlijst.svg"}
          alt={data?.title}
          className="w-full rounded-lg"
        />
        <span className="absolute bottom-2 right-2 bg-black bg-opacity-10 text-white text-xs px-1.5 py-0.5 rounded">
          {data?.duration}
        </span>
      </div>

      {/* Video Info */}
      <div className="flex mt-3">
        {/* Channel Avatar */}
        <img
          src="https://ralfvanveen.com/wp-content/uploads/2021/06/Placeholder-_-Begrippenlijst.svg"
          alt={data?.channel}
          className="w-10 h-10 rounded-full"
        />

        {/* Title & Channel */}
        <div className="ml-3">
          <h3 className="text-sm font-semibold line-clamp-2">{data?.title}</h3>
          <p className="text-xs text-gray-600">{data?.channel}</p>
          <p className="text-xs text-gray-500">
            {data?.views} views • {data?.uploaded}
          </p>
        </div>
      </div>
    </div>
  );
}

export default VideoCard;
