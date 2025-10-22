import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Upload } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import axios from 'axios'
import config from '../../config'
import { useUpload } from '../Hooks/useUpload'

function UploadVideoDialog() {
  const [thumbnailPreview, setThumbnailPreview] = useState(null)
  const [isPublic, setIsPublic] = useState(true)
  const {createAndStartUpload} = useUpload();

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setThumbnailPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    try {
      e.preventDefault()
      // const formData = new FormData()
      // formData.append("title", e.target.title.value)
      // formData.append("description", e.target.description.value)
      // formData.append("thumbnail", e.target.thumbnail.files[0]);
      // formData.append("isPublic", isPublic)
      const payload = {
        title: e.target.title.value,
        description: e.target.description.value,
        thumbnail: e.target.thumbnail.files[0],
        isPublic: isPublic,
        video: e.target.video.files[0]
      }
  
      await createAndStartUpload(payload)
      // TODO: Handle upload logic here (R2 or Cloudinary)
      // console.log("Form submitted:", Object.fromEntries(formData))
      // const {data} = await axios.post(`${config.BACKEND_ENDPOINT}/api/videos/upload-video-image`, formData, {
      //   withCredentials: true,
      //   headers: {
      //     "Content-Type": 'multipart/form-data'
      //   }
      // })
    } catch (error) {
      console.log("Error occurred while uploading video", error)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
        variant="outline"
          className="hidden md:flex"
        >
          <Upload /> Upload Video
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] mx-4 sm:mx-0 p-4 sm:p-6 rounded-xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Upload a Video</DialogTitle>
          <DialogDescription>
            Choose your video, thumbnail, and metadata to upload to MediaForge.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail</Label>
              <Input
                id="thumbnail"
                name="thumbnail"
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
              />
              {thumbnailPreview && (
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail Preview"
                  className="w-full h-40 object-cover rounded-lg border border-zinc-200 dark:border-zinc-700"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="video">Video File</Label>
              <Input id="video" name="video" type="file" accept="video/*" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder="Enter video title" required minLength={20}/>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Write a short description..."
                className="resize-y"
                minLength={20}
              />
            </div>

            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <Label htmlFor="public" className="text-sm">
                Make Public
              </Label>
              <Switch
                id="public"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
            </div>
            <DialogFooter className="pt-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Upload</Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}


export default UploadVideoDialog