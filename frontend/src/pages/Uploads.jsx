import React from 'react'
import UploadCard from '../components/UploadCard'
import { useUpload } from '../Hooks/useUpload';
// import { useUploadManager } from '../Hooks/useUploadManager';

function Uploads() {
  const { uploads } = useUpload();

  return (
    <>
      <div className="w-[calc(75%)] bg-zinc-600 p-4 grid grid-cols-3 gap-3 ">
        {uploads && uploads.map(u => <UploadCard key={u.videoId} meta={u} />)}
      </div>
    </>
  )
}

export default Uploads