"use client";

import { useState } from "react";

export default function AquaticBackground() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="krypton-aquatic-media" aria-hidden="true">

      <video
        className={`krypton-aquatic-video ${
          loaded ? "is-loaded" : ""
        }`}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onCanPlay={() => setLoaded(true)}
      >
        <source src="/media/krypton-water.mp4" type="video/mp4" />
      </video>

      <div className="krypton-aquatic-overlay" />

      <div className="krypton-aquatic-shimmer" />

    </div>
  );
}
