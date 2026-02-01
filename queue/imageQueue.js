import bull from "bull";

import { processImageJob } from "../workers/image.worker.js";
const imageQueue = new bull("image-processing-queue", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
  },
});
imageQueue.process(processImageJob);
export default imageQueue;
