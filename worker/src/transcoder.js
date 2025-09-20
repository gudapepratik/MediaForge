// ffmpeg transcoding pipeline

export const transcodeVideo = async (videoId, outputFormats) => {
  try {
    return new Promise((resolve) => setTimeout(resolve("done"), 10000));
  } catch (error) {
    console.log(`Error while transcoding video ${videoId}`)
  }
}