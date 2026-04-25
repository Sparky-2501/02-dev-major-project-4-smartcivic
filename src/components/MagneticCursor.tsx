import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function MagneticCursor() {
  const cursorX = useMotionValue(-200);
  const cursorY = useMotionValue(-200);
  const trailX = useMotionValue(-200);
  const trailY = useMotionValue(-200);

  const springCfgFast = { damping: 28, stiffness: 700, mass: 0.3 };
  const springCfgSlow = { damping: 40, stiffness: 150, mass: 0.8 };

  const dotX = useSpring(cursorX, springCfgFast);
  const dotY = useSpring(cursorY, springCfgFast);
  const ringX = useSpring(trailX, springCfgSlow);
  const ringY = useSpring(trailY, springCfgSlow);

  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [label, setLabel] = useState("");
  const [hidden, setHidden] = useState(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    let mx = -200, my = -200;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      cursorX.set(mx);
      cursorY.set(my);
      trailX.set(mx);
      trailY.set(my);
      setHidden(false);
    };

    const onDown = () => setClicked(true);
    const onUp = () => setClicked(false);
    const onLeave = () => setHidden(true);
    const onEnter = () => setHidden(false);

    // Detect what element is hovered
    const onOverElement = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isLink = target.closest("a, button, [role='button'], input, select, textarea, label");
      const isCard = target.closest(".glass-card, .glass-card-hover");
      const isImage = target.closest("img");

      if (isImage) { setHovered(true); setLabel("VIEW"); }
      else if (isLink) { setHovered(true); setLabel(""); }
      else if (isCard) { setHovered(true); setLabel(""); }
      else { setHovered(false); setLabel(""); }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    window.addEventListener("mouseover", onOverElement);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      window.removeEventListener("mouseover", onOverElement);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return null;

  return (
    <>
      {/* Outer ring — slow follower */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: clicked ? 28 : hovered ? 56 : 36,
          height: clicked ? 28 : hovered ? 56 : 36,
          opacity: hidden ? 0 : 1,
          borderColor: hovered ? "rgba(168,85,247,0.9)" : "rgba(255,255,255,0.8)",
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
          border: "1.5px solid rgba(255,255,255,0.8)",
          borderRadius: "50%",
        }}
      >
        {label && (
          <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black tracking-widest text-white">
            {label}
          </span>
        )}
      </motion.div>

      {/* Inner dot — fast follower */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          x: dotX,
          y: dotY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: clicked ? 4 : hovered ? 6 : 6,
          height: clicked ? 4 : hovered ? 6 : 6,
          opacity: hidden ? 0 : 1,
          backgroundColor: hovered ? "rgba(168,85,247,1)" : "rgba(255,255,255,1)",
          scale: clicked ? 0.5 : 1,
        }}
        transition={{ duration: 0.12 }}
        style={{
          x: dotX,
          y: dotY,
          translateX: "-50%",
          translateY: "-50%",
          borderRadius: "50%",
          backgroundColor: "white",
        }}
      />
    </>
  );
}
