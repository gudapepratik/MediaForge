import React, { useState } from "react";

function UploadCard({ upload = null }) {
  const dummyUpload = {
    thumbnail: "https://i.ytimg.com/vi/ysz5S6PUM-U/maxresdefault.jpg",
    title: "Uploading: My Awesome Video",
    progress: 45, // %
    status: "uploading", // uploading | paused | completed
  };

  const [data, setData] = useState(upload || dummyUpload);

  const handlePauseResume = () => {
    if (data.status === "uploading") {
      setData({ ...data, status: "paused" });
    } else if (data.status === "paused") {
      setData({ ...data, status: "uploading" });
    }
  };

    const handleCancel = () => {
      setData({ ...data, status: "canceled", progress: 0 });
    };

  return (
    <div className="max-w-md rounded-2xl h-fit shadow-md p-4 bg-white flex gap-4 items-start">
      {/* Thumbnail */}
      <img
        src={data.thumbnail}
        alt="uploading video"
        className="w-32 h-20 object-cover rounded-lg"
      />

      {/* Details */}
      <div className="flex-1">
        <h3 className="text-sm font-semibold">{data.title}</h3>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-2 rounded mt-2 overflow-hidden">
          <div
            className={`h-2 ${
              data.status === "paused"
                ? "bg-yellow-500"
                : data.status === "completed"
                ? "bg-green-500"
                : "bg-blue-500"
            }`}
            style={{ width: `${data.progress}%` }}
          />
        </div>

        <p className="text-xs mt-1 text-gray-500">
          {data.status === "uploading" && `Uploading... ${data.progress}%`}
          {data.status === "paused" && `Paused at ${data.progress}%`}
          {data.status === "completed" && "Upload completed ✅"}
          {data.status === "canceled" && "Upload canceled ❌"}
        </p>

        {/* Buttons */}
        {data.status !== "completed" && data.status !== "canceled" && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={handlePauseResume}
              className="px-3 py-1 text-xs rounded bg-blue-500 text-white"
            >
              {data.status === "uploading" ? "Pause" : "Resume"}
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-xs rounded bg-red-500 text-white"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadCard;
