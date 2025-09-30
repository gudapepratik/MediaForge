
import { execFile, execFileSync } from "child_process";
import ffmpegPath from "ffmpeg-static";

console.log("FFmpeg path:", ffmpegPath);
execFile(ffmpegPath, ["-version"], (error, stdout, stderr) => {
  if (error) {
    console.error("FFmpeg test failed:", error);
    return;
  }
  console.log(stdout);
});

