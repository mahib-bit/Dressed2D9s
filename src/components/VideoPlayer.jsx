import { useEffect, useRef } from "react";
import Hls from "hls.js";

// Plays HLS (.m3u8) via hls.js and normal files (.mp4/.webm) natively.
// `src` is any stream URL you have the rights to play.
//  - startAt:    seconds to resume from
//  - onProgress: (time, duration) called at most every 5 seconds, and on pause
export default function VideoPlayer({ src, poster, onEnded, startAt = 0, onProgress }) {
  const videoRef = useRef(null);
  const lastSent = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let hls;
    const isHls = src.includes(".m3u8");

    if (isHls && Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
    } else {
      // Safari plays HLS natively; mp4/webm work everywhere
      video.src = src;
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [src]);

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    // resume, but not if the user was almost at the end
    if (video && startAt > 5 && (!video.duration || startAt < video.duration - 10)) {
      video.currentTime = startAt;
    }
  };

  const report = (force) => {
    const video = videoRef.current;
    if (!video || !onProgress || !video.duration) return;
    const now = Date.now();
    if (!force && now - lastSent.current < 5000) return;
    lastSent.current = now;
    onProgress(video.currentTime, video.duration);
  };

  return (
    <video
      ref={videoRef}
      poster={poster}
      controls
      playsInline
      onLoadedMetadata={handleLoadedMetadata}
      onTimeUpdate={() => report(false)}
      onPause={() => report(true)}
      onEnded={onEnded}
      className="aspect-video w-full rounded-box bg-black"
    />
  );
}
