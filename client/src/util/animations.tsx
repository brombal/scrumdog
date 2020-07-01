import { motion } from "framer-motion";
import React from "react";
import $, { StylixProps } from "stylix";

interface ZoomAnimateProps {
  visible?: boolean;
  scale?: any;
  children: any;
  exitForward?: boolean;
}

export function ZoomAnimate({
  visible = true,
  scale = 0.85,
  exitForward = false,
  ...other
}: StylixProps & ZoomAnimateProps) {
  return (
    <$
      data-label="ZoomAnimate"
      $el={motion.div}
      variants={{
        visible: { opacity: 1, scale: 1, pointerEvents: "auto" },
        hidden: { opacity: 0, scale, pointerEvents: "none" },
        forward: { opacity: 0, scale: 1 / scale, pointerEvents: "none" },
      }}
      initial="hidden"
      exit={exitForward ? "forward" : "hidden"}
      $elProps={{ transition: { scale: { type: "spring", damping: 20, stiffness: 150 } } }}
      animate={visible ? "visible" : "hidden"}
      {...other}
    />
  );
}

interface SlideAnimateProps {
  visible?: boolean;
  distance?: any;
  children: any;
}

export function SlideAnimate({ visible = true, distance = -100, ...other }: StylixProps & SlideAnimateProps) {
  return (
    <$
      data-label="SlideAnimate"
      $el={motion.div}
      variants={{
        visible: { translateY: 0, pointerEvents: "auto" },
        hidden: { translateY: distance, pointerEvents: "none" },
      }}
      initial="hidden"
      exit="hidden"
      $elProps={{ transition: { scale: { type: "spring", damping: 20, stiffness: 150 } } }}
      animate={visible ? "visible" : "hidden"}
      {...other}
    />
  );
}

interface FlipAnimateProps {
  visible?: boolean;
  reverse?: boolean;
  children: any;
}

export function FlipAnimate({ visible = true, reverse = false, ...other }: StylixProps & FlipAnimateProps) {
  return (
    <$
      data-label="FlipAnimate"
      $el={motion.div}
      variants={{
        visible: { rotateY: 0, pointerEvents: "auto" },
        hidden: { rotateY: reverse ? "-180deg" : "180deg", pointerEvents: "none" },
      }}
      initial="hidden"
      exit="hidden"
      animate={visible ? "visible" : "hidden"}
      $elProps={{ transition: { rotateY: { type: "spring", damping: 200, stiffness: 150 } } }}
      backfaceVisibility="hidden"
      {...other}
    />
  );
}
