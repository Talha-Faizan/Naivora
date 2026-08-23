"use client";

import React, { useEffect, useRef, useState, useId, useInsertionEffect } from "react";

const MarqueeText = ({
  children,
  speed = 50, // Pixels per second (higher = faster)
  direction = "left", // "left" or "right"
  pauseOnHover = true,
  className = "",
}) => {
  const [contentWidth, setContentWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const contentRef = useRef(null);
  const containerRef = useRef(null);

  const id = useId().replace(/:/g, "");
  const animationName = `marquee-${direction}-${id}`;

  // useInsertionEffect fires before any DOM mutation — the browser never sees
  // the style-tag absent, so there's no flash and no layout recalc on inject.
  // This also runs once per unique animationName, not on every render.
  useInsertionEffect(() => {
    if (!contentWidth) return;

    const css = `@keyframes ${animationName} {
      0%   { transform: translateX(${direction === "left" ? "0px" : `-${contentWidth}px`}); }
      100% { transform: translateX(${direction === "left" ? `-${contentWidth}px` : "0px"}); }
    }`;

    const style = document.createElement("style");
    style.setAttribute("data-marquee-id", id);
    style.textContent = css;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [animationName, contentWidth, direction, id]);

  useEffect(() => {
    const calculate = () => {
      if (contentRef.current && containerRef.current) {
        setContentWidth(contentRef.current.offsetWidth);
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    calculate();

    // ponytail: single ResizeObserver on the container is cheaper than a
    // window resize listener per instance (4× previously)
    const ro = new ResizeObserver(calculate);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [children]);

  // Measuring phase — render invisibly to get widths
  if (!contentWidth || !containerWidth) {
    return (
      <div ref={containerRef} style={{ overflow: "hidden", width: "100%" }} className={className}>
        <div ref={contentRef} style={{ display: "inline-flex", whiteSpace: "nowrap" }}>
          {children}
        </div>
      </div>
    );
  }

  const copies = Math.max(2, Math.ceil(containerWidth / contentWidth) + 1);
  const duration = contentWidth / speed;

  return (
    <div
      className={`overflow-hidden w-full flex ${className}`}
      ref={containerRef}
    >
      <div
        className="flex whitespace-nowrap"
        style={{
          animation: `${animationName} ${duration}s linear infinite`,
          // Promote to its own compositor layer — browser can animate without
          // triggering layout or paint on every frame.
          willChange: "transform",
        }}
        onMouseEnter={(e) =>
          pauseOnHover && (e.currentTarget.style.animationPlayState = "paused")
        }
        onMouseLeave={(e) =>
          pauseOnHover && (e.currentTarget.style.animationPlayState = "running")
        }
      >
        {[...Array(copies)].map((_, i) => (
          <div key={i} className="flex items-center shrink-0">
            {children}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarqueeText;