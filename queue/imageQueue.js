import Bull from "bull";
import { processImageJob } from "../workers/image.worker.js";

const imageQueue = new Bull("image-processing", {
  redis: {
    host: "127.0.0.1",
    port: 6379,
  },
});

imageQueue.on("error", (err) => {
  console.log("Redis error:", err.message);
});

imageQueue.on("waiting", (jobId) => {
  console.log("Job waiting:", jobId);
});

imageQueue.on("active", (job) => {
  console.log("Job active:", job.id);
});

imageQueue.on("completed", (job) => {
  console.log("Job completed:", job.id);
});

imageQueue.on("failed", (job, err) => {
  console.log("Job failed:", job.id, err.message);
});

// concurrency = 3 workers
imageQueue.process("process-images", 3, processImageJob);

export default imageQueue;
