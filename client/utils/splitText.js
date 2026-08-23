import React from 'react';

/**
 * Utility to split a string into words or characters, wrapping each in a span
 * with a specific class for GSAP stagger animations.
 *
 * @param {string} text - The text to split
 * @param {string} type - "words" or "chars"
 * @param {string} className - Additional classes for the wrappers
 */
export const SplitText = ({ text, type = "words", className = "" }) => {
  if (typeof text !== "string") return text;

  if (type === "chars") {
    return text.split("").map((char, index) => (
      <span key={index} className={`inline-block whitespace-pre ${className}`}>
        {char === " " ? "\u00A0" : char}
      </span>
    ));
  }

  // Default: words
  return text.split(" ").map((word, index) => (
    <span key={index} className={`inline-block ${className}`}>
      {word}&nbsp;
    </span>
  ));
};
