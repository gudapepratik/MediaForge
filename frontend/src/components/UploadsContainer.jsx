import React from 'react'
import { useUpload } from '../Hooks/useUpload';
import UploadCard from './UploadCard';

function UploadsContainer() {
  const { uploads } = useUpload();

  return (
    <div className="w-fullrounded-md p-4 grid grid-cols-3 gap-3 ">
      {uploads && uploads.map(u => <UploadCard key={u.videoId} meta={u} />)}
    </div>
  )
}

export default UploadsContainer