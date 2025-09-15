import React, { useState } from "react";
import { useUploadManager } from "../Hooks/useUploadManager";
import { useUpload } from "../Hooks/useUpload";

function VideoUpload() {
    const [file, setFile] = useState(null);
    const { createAndStartUpload } = useUpload();

    async function handleSubmit(e) {
      e.preventDefault();
      if (!file) return;
      try {
        await createAndStartUpload(file);
        alert("Upload started, open Uploads page to monitor.");
      } catch (err) {
        console.error(err);
        alert("Failed to start upload");
      }
    }

    const handleVideoChange = (e) => {
        e.preventDefault();

        if(e.target.files?.[0]) {
          setFile(e.target.files[0]);
        }
    }

    return (
        <div className="w-full h-100px flex justify-end p-4 bg-zinc-700">
        <form
            onSubmit={handleSubmit}
            className="bg-zinc-800 flex gap-2 p-4 items-center"
        >
            <label htmlFor="videofile" className="text-white">
            + add
            </label>
            <input
            hidden
            type="file"
            id="videofile"
            className="px-4 py-3 rounded-md bg-red-700 text-white"
            onChange={handleVideoChange}
            />
            {file && <p className="text-green-500">{file.name}</p>}
            <button type="submit" className="bg-red-500 px-2 text-white">
            Submit
            </button>
        </form>
        </div>
    );
}

export default VideoUpload;
