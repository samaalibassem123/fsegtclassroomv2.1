"use client";
import React from "react";
import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";

export default function page() {
  return (
    <div className="w-full h-full z-0">
      <Tldraw />
    </div>
  );
}
