import React from 'react'
import UploadCard from '../components/UploadCard'

function Uploads() {
  return (
    <>
      <div className="w-[calc(75%)] bg-zinc-600 p-4 grid grid-cols-3 gap-3 ">
        <UploadCard />
        <UploadCard />
        <UploadCard />
        <UploadCard />
      </div>
    </>
  )
}

export default Uploads