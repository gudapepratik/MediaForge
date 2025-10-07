import {GetObjectCommand, PutObjectCommand} from '@aws-sdk/client-s3'
import ffmpegPath from 'ffmpeg-static'
import path from 'node:path'
import fs from 'fs'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { exec, execFile } from 'node:child_process'
import ffprobe from 'ffprobe-static'
import s3Client from './s3.js'
import { ProgressUpdate } from './progess-update.js'
import redis from './redis.js'

dotenv.config();

const PRIVATE_BUCKET = process.env.PRIVATE_BUCKET;
const PUBLIC_BUCKET = process.env.PUBLIC_BUCKET;
const inputFilePath = path.resolve('./video.mp4')
const outputDir = path.resolve('./output/hls')

// all renditions (will create only required - no upscaling)
const renditions = [
  { name: "240p",  size: "426x240",   bitrate: "400k",   maxrate: "428k",   bufsize: "600k",   audio: "64k"  },
  { name: "360p",  size: "640x360",   bitrate: "800k",   maxrate: "856k",   bufsize: "1200k",  audio: "96k"  },
  { name: "480p",  size: "854x480",   bitrate: "1400k",  maxrate: "1498k",  bufsize: "2100k",  audio: "128k" },
  { name: "720p",  size: "1280x720",  bitrate: "2800k",  maxrate: "2996k",  bufsize: "4200k",  audio: "128k" },
  { name: "1080p", size: "1920x1080", bitrate: "5000k",  maxrate: "5350k",  bufsize: "7500k",  audio: "192k" },
  { name: "1440p", size: "2560x1440", bitrate: "9000k",  maxrate: "9650k",  bufsize: "13500k", audio: "192k" },
  { name: "4K",    size: "3840x2160", bitrate: "18000k", maxrate: "19800k", bufsize: "27000k", audio: "256k" }
];

async function getVideoMetadata(filePath) {
  return new Promise((resolve, reject) => {
    const command = `"${ffprobe.path}" -v quiet -print_format json -show_format -show_streams "${filePath}"`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Error:", error.message);
        return reject(error);
      }
      if (stderr && error) {
        console.error("Stderr:", stderr);
        return reject(stderr)
      }
  
      try {
        const metadata = JSON.parse(stdout);
        resolve(metadata)
      } catch (error) {
        reject(error);
      }
    })
  })
}

async function downloadVideo(key, progressUpdater) {
  try {
    await progressUpdater.sendPubSubUpdate('downloading', 5, "Video download has started..");

    const downloadCommand = new GetObjectCommand({
      Bucket: PRIVATE_BUCKET,
      Key: key
    })

    const {Body} = await s3Client.send(downloadCommand);

    if(Body) {
      const filePath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'video.mp4');
      const writeStream = fs.createWriteStream(filePath);

      Body.pipe(writeStream);

      await new Promise((resolve, reject) => {
        writeStream.on('finish', () => {
          console.log("Video is downlaoded from S3");
          progressUpdater.sendPubSubUpdate('downloading', 20, "Video downloaded..");
          resolve();
        });

        writeStream.on('error', (e) => {
          console.log("Error occcurred while downloading the video");
          reject(e);
        })
      })
    } else{
      console.log('No data recieved from s3')
    }
  } catch (error) {
    console.log('Error occurred while downloading', error)
  }
}

async function transcode(progressUpdater) {
  try {
    if(!fs.existsSync(outputDir)){ 
      fs.mkdirSync(outputDir, {recursive: true});
    }
  
    await progressUpdater.sendPubSubUpdate('transcoding', 25, "transcoding has started..");
    
    // get video metadata of original video using ffProbe
    const videoMetadata = await getVideoMetadata(inputFilePath);
    const duration = parseFloat(videoMetadata.format.duration);
    const ogHeight = videoMetadata.streams[0].height;
    const ogWidth = videoMetadata.streams[0].width;
  
    await progressUpdater.sendPubSubUpdate('transcoding', 30, "Video metadata fetched..", {
      duration: duration,
      resolution: `${ogWidth}x${ogHeight}`,
      codec: videoMetadata.streams[0].codec_name
    });
  
    const supportedRenditions = renditions.filter(r => ogHeight >= Number(r.size.split('x')[1]))
  
    // ffmpeg arguments
    const ffmpegArgs = [
      '-y',
      '-i', inputFilePath,
      '-filter_complex', supportedRenditions.map((r, i) => `[0:v]scale=${r.size}[v${i}]`).join(";"),
    ]
  
    supportedRenditions.forEach((r, i) => {
      const outPath = path.join(outputDir, `${r.name}.m3u8`);
  
      ffmpegArgs.push(
        "-map", `[v${i}]`,      // video stream
        "-c:v:" + i, "h264",    // codec
        "-map", "0:a", // audio
        "-b:v:" + i, r.bitrate,
        "-maxrate:v:" + i, r.maxrate,
        "-bufsize:v:" + i, r.bufsize,
        "-c:a:" + i, "aac",
        "-b:a:" + i, r.audio,
        "-ar", "48000",
        "-preset", "fast",
        "-hls_time", "6", // 6 seconds .ts files
        "-hls_playlist_type", "vod",
        "-hls_segment_filename", path.join(outputDir, `${r.name}_%03d.ts`),
      outPath
      );
    })
    ffmpegArgs.push('-progress', 'pipe:1', '-nostats');
  
    await progressUpdater.sendPubSubUpdate('transcoding', 40, "Starting FFmpeg encoding...");
  
    return new Promise((resolve, reject) => {
      const ffmpegProcess = execFile(ffmpegPath, ffmpegArgs);
  
      let lastProgress = 40;
      let isErrorDetected = false;
  
      ffmpegProcess.stdout.on('data', async (data) => {
        const lines = data.toString().split('\n');

        for (const line of lines) {
          if (line.startsWith('out_time=')) {
            const timeStr = line.split('=')[1];
            const currentTime = parseTimeToSeconds(timeStr);
            
            if (currentTime > 0 && duration > 0) {
              const percent = currentTime / duration;
              
              const progress = Math.floor(40 + (percent * 30));
              
              // Send update every 5%
              if (progress % 5 === 0) {
                await progressUpdater.sendPubSubUpdate('transcoding', progress, 
                  `Encoding: ${Math.floor(currentTime)}s / ${Math.floor(duration)}s`
                );
                lastProgress = progress;
              }
            }
          }
        }
      });
  
      // check for errors
      ffmpegProcess.stderr.on('data', (data) => {
        const logData = data.toString();
        console.log("FFmpeg logs:", logData);
          
        // Check for critical errors
        if (logData.toLowerCase().includes('error') || logData.toLowerCase().includes('failed') || logData.toLowerCase().includes('invalid')) {
          console.error("FFmpeg error detected:", logData);
          isErrorDetected =  true;
        }
      });
  
      // handle finish task
      ffmpegProcess.on('close', async (code) => {
        if(code === 0) {
          await progressUpdater.sendPubSubUpdate('transcoding', 70, "Creating master playlist...");

          const masterPlaylist = supportedRenditions.map(r =>
            `#EXT-X-STREAM-INF:BANDWIDTH=${r.bitrate.replace("k","000")},RESOLUTION=${r.size}\n${r.name}.m3u8`
          ).join("\n");
      
          fs.writeFileSync(path.join(outputDir, "master.m3u8"), "#EXTM3U\n" + masterPlaylist);
  
          const outputFiles = fs.readdirSync(outputDir);
          const segmentFiles = outputFiles.filter(f => f.endsWith('.ts')).length;
          const playlistFiles = outputFiles.filter(f => f.endsWith('.m3u8')).length;
  
          await progressUpdater.sendPubSubUpdate('transcoding', 75, "Transcoding completed successfully", {
            totalFiles: outputFiles.length,
            segmentFiles: segmentFiles,
            playlistFiles: playlistFiles,
            renditions: supportedRenditions.map(r => r.name),
            processingTime: Date.now() - ffmpegProcess.spawnargs?.startTime || 'unknown'
          });
  
          console.log("✅ Transcoding finished. Master playlist generated.");
  
          resolve();
        } else{
          await progressUpdater.sendBullmqUpdate('transcoding', lastProgress, `FFmpeg process failed with exit code ${code}`, {
            error: true,
            exitCode: code,
            lastProgress: lastProgress
          });
  
          reject(new Error( `FFmpeg process failed with exit code ${code}`));
        }
      })
    })
  } catch (error) {
    console.error("Transcoding setup error:", error);
    
    await progressUpdater.sendBullmqUpdate('transcoding', 25, "Transcoding setup failed", {
      error: true,
      errorMessage: error.message,
    });
    
    throw error;
  }
}

async function uploadHlsToR2(userId, videoId, progressUpdater) {
  let currentProgress = 80;
  try {
    await progressUpdater.sendPubSubUpdate('uploading HLS', 80, "Uploading HLS started...");
    const files = fs.readdirSync(outputDir);
    const totalFiles = files.length;

    const progressStep = 15 / totalFiles;
  
    for(let i=0; i < totalFiles; i++) {
      const file = files[i];
      const filePath = path.join(outputDir, file);
      const fileStream = fs.createReadStream(filePath);
      
      const command = new PutObjectCommand({
        Bucket: PUBLIC_BUCKET,
        Key: `videos/${userId}/${videoId}/hls/${file}`,
        Body: fileStream,
        ContentType: file.endsWith(".m3u8") ? "application/vnd.apple.mpegurl" : "video/MP2T",
      })
  
      await s3Client.send(command);
      currentProgress = Math.min(95, currentProgress + progressStep);
      await progressUpdater.sendPubSubUpdate('uploading HLS', Math.round(currentProgress), `uploaded ${i+1} of ${totalFiles} files..`);
      console.log(`${file} is uploaded to public bucket`)
    }
    const masterKey = `videos/${userId}/${videoId}/hls/master.m3u8`;
    return {masterKey};
  } catch (error) {
    await progressUpdater.sendPubSubUpdate('uploading HLS', Math.round(currentProgress), `Error occurred while uploading HLS files`);
    console.log("Error occcurred ")
    throw error;
  }
} 

async function cleanupTempFiles(progressUpdater = null, sendUpdates = true) {
  console.log("Cleaning up temporary files...")
  if(sendUpdates) await progressUpdater.sendPubSubUpdate('finalizing', 95, "finalizing transcoding...");
  
  try {
    if(fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, {recursive: true, force: true})
      console.log("Deleted HLS output directory", outputDir)
    }
  } catch (error) {
    console.log("Error occured while deleting HLS output directory", outputDir)
  }

  try {
    if(fs.existsSync(inputFilePath)) {
      fs.rmSync(inputFilePath, {force: true})
      console.log("Deleted original video File", inputFilePath)
    }
  } catch (error) {
    console.log("Error occured while deleting original video File", inputFilePath)
  }
  console.log("Cleanup Done")
}

export default async function(job) {
  // Key = `videos/${userId}/${videoId}/original/${fileName}`
  let {key} = job.data;

  const keyData = key.split('/');
  const userId = keyData[1];
  const videoId = keyData[2];
  const fileName = keyData[4];

  const progressUpdater = new ProgressUpdate(redis, job.id, videoId, userId, job);
  try {
    // 1. download video from r2 and store locally 
    await downloadVideo(key, progressUpdater);
    
    // 2. perform transcoding of the file
    await transcode(progressUpdater);
  
    // 3. upload all the files to public R2 bucket
    const {masterKey} = await uploadHlsToR2(userId, videoId, progressUpdater);
  
    // 4. delete temp files from local storage (cleanup)
    await cleanupTempFiles(progressUpdater);

    await progressUpdater.sendPubSubUpdate('completed', 100, "Transcoding completed successfully, your file is now ready...", {key: masterKey});
  } catch (error) {
    console.error(`Error occurred while transcoding for JOb ${job.id}`, error);
    await cleanupTempFiles(null, false);
    await progressUpdater.sendPubSubUpdate('failed', 0, `Error occurred while transcoding video ${videoId}, JOB ${job.id}`, {key});
    throw error;   
  }  
}

// HELPER FUNCTIONS
function parseTimeToSeconds(timeStr) {
  if (!timeStr || timeStr === 'N/A') return 0;
  
  try {
    // FFmpeg time format: HH:MM:SS.mmm or seconds.mmm
    if (timeStr.includes(':')) {
      const parts = timeStr.split(':');
      if (parts.length === 3) {
        const hours = parseFloat(parts[0]) || 0;
        const minutes = parseFloat(parts[1]) || 0;
        const seconds = parseFloat(parts[2]) || 0;
        return hours * 3600 + minutes * 60 + seconds;
      }
    } else {
      // Direct seconds format
      return parseFloat(timeStr) || 0;
    }
  } catch (error) {
    console.warn('Failed to parse time:', timeStr, error);
  }
  
  return 0;
}