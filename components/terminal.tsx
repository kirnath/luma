"use client";

import React, { useEffect } from "react";
import "@jup-ag/terminal/css";

export default function TerminalComponent() {
  useEffect(() => {
    import("@jup-ag/terminal").then((mod) => {
      const { init } = mod;
      init({
        displayMode: "widget",
        integratedTargetId: "jupiter-terminal",
      });
    });
  }, []);

  return (
    <div>
      <div id="jupiter-terminal" />
    </div>
  );
}