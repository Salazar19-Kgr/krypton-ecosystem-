"use client";

import { useEffect } from "react";

export default function NoAnim() {
  useEffect(() => {
    const el = document.documentElement;
    el.classList.add("k-noanim-page");
    return () => el.classList.remove("k-noanim-page");
  }, []);
  return null;
}
