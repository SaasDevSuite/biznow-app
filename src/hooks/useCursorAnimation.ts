import { useEffect } from 'react';

/**
 * Custom hook for cursor animation effect
 * Creates a radial gradient that follows the cursor movement
 * Used in authentication pages for visual feedback
 */
export function useCursorAnimation() {
  useEffect(() => {
    const bg = document.getElementById("cursor-bg");
    let animationFrame: number;
    let timeoutId: NodeJS.Timeout;

    const pos = { x: 0, y: 0 };
    let target = { x: 0, y: 0 };

    const updatePosition = () => {
      pos.x += (target.x - pos.x) * 0.1;
      pos.y += (target.y - pos.y) * 0.1;

      if (bg) {
        bg.style.background = `radial-gradient(500px at ${pos.x}px ${pos.y}px, rgba(98, 75, 250, 0.15), transparent 80%)`;
      }

      animationFrame = requestAnimationFrame(updatePosition);
    };

    const startAnimation = (x: number, y: number) => {
      target = { x, y };
      if (bg) bg.style.opacity = "1";
      if (!animationFrame) animationFrame = requestAnimationFrame(updatePosition);

      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (bg) bg.style.opacity = "0";
      }, 1500);
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const x = "touches" in e ? e.touches[0].clientX : e.clientX;
      const y = "touches" in e ? e.touches[0].clientY : e.clientY;
      startAnimation(x, y);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleMove);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
      cancelAnimationFrame(animationFrame);
    };
  }, []);
}
