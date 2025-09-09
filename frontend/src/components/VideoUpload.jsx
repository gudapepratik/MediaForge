import axios from 'axios';
import React from 'react'
import config from '../../config';
import { useState } from 'react';

function VideoUpload() {
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleSubmit =  async (e) => {
        e.preventDefault();

        try {
            const file = e.target[0].files[0];
    
            const {data} = await axios.post(`${config.BACKEND_ENDPOINT}/api/videos/upload-request/?fileName=${file.name}&contentType=${file.type}&fileSize=${file.size}`, null, {
                withCredentials: true
            })
    
            // console.log(data)
            // const url = 'mediaforge.b1f051270c57fc06756a331474317b0d.r2.cloudflarestorage.com/videos/cmf6uo67r0000ny0zsb24zp1y/cmf73h5za0001nypt8idia6qv/original/VID_20220830_144701.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=3a6bdc33f09cdaf72cfdba86f2f606f5%2F20250905%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20250905T171408Z&X-Amz-Expires=900&X-Amz-Signature=c260a3d25b4795b59b440ef27ce9b7394d2eaadb66867ecb2ef89df6b2f99355&X-Amz-SignedHeaders=host&x-amz-checksum-crc32=AAAAAA%3D%3D&x-amz-sdk-checksum-algorithm=CRC32&x-id=PutObject'
            await axios.put(data.data.uploadUrl, file, {
                headers: {
                    "Content-Type": file.type
                },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percent);
                }
            })

            console.log("Upload complete");
            await axios.post(`${config.BACKEND_ENDPOINT}/api/videos/mark-upload-success/${data.data.videoId}`, null, {
                withCredentials: true
            })
            console.log("DONE");
        } catch (error) {
            console.log(error)
        }
    }
  return (
    <div>
        <form onSubmit={handleSubmit} className=''>
            <label htmlFor="video">Upload Video</label>
            <input className='' max={1} type="file" name="video" id="video" />
            
            <button type='submit'>UPLOAD</button>
        </form>

        <div className='h-1'>
            Upload PRogress: {uploadProgress}
        </div>
    </div>
  )
}

export default VideoUpload