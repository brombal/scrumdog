import { AnimatePresence, motion } from "framer-motion";
import doShuffle from "lodash/shuffle";
import React, { useEffect, useRef, useState } from "react";
import { useUpdate, useUpdateEffect } from "react-use";

import { delay } from "@shared/util";

import $, { StylixProps } from "stylix";
import { flexCentered } from "@client/ui/styles";

interface CardStackProps {
  cardWidth: number;
  cardHeight: number;
  children: any;
  shuffle?: boolean; // Causes cards to animate shuffle when changed
  onShuffleState?(state: ShuffleState): void; // Passed current `shuffle` value and animation state (passing `shuffle` helps to keep values in sync)
}

export type ShuffleState = [boolean, "" | "stack" | "unstack"];

export default function CardStack({
  cardWidth,
  cardHeight,
  children,
  shuffle,
  onShuffleState,
  ...other
}: CardStackProps & StylixProps) {
  const childArr = React.Children.toArray(children) as React.ReactElement[];
  const cols = childArr.length <= 4 ? childArr.length : Math.ceil(childArr.length / 2);
  const width = cardWidth * cols;
  const height = cols < childArr.length ? cardHeight * 2 : cardHeight;
  const update = useUpdate();

  const layout = childArr.map((child, i) => {
    const row = i < cols ? 0 : 1;
    const col = i % cols;
    return {
      row,
      col,
      x: col * cardWidth + (childArr.length % 2 === 0 ? 0 : (row * cardWidth) / 2),
      y: row * cardHeight,
    };
  });

  const childOrder = useRef(childArr.map((c, i) => i));

  const [isShuffling, setIsShuffling] = useState(false);
  useUpdateEffect(() => {
    (async () => {
      onShuffleState?.([shuffle, "stack"]);
      setIsShuffling(true);

      await delay(0.7);

      onShuffleState?.([shuffle, "unstack"]);
      childOrder.current = childArr.map((c, i) => i);
      if (shuffle) childOrder.current = doShuffle(childOrder.current);

      setIsShuffling(false);

      await delay(0.5);

      onShuffleState?.([shuffle, ""]);
    })();
  }, [shuffle]);

  useEffect(() => {
    onShuffleState?.([shuffle, ""]);
  }, []);

  useEffect(() => {
    childOrder.current = childArr.map((c, i) => i);
    if (shuffle) childOrder.current = doShuffle(childOrder.current);
    update();
  }, [children.length]);

  return (
    <$.div data-label="CardStack" {...other} display="flex" align-items="center" justify-content="center">
      <$
        $el={motion.div}
        initial={false}
        animate={{ width: width + "rem", height: height + "rem" }}
        $elProps={{ transition: { type: "spring", damping: 100, stiffness: 200 } }}
        display="flex"
        flex-wrap="wrap"
        justify-content="center"
        align-items="center"
        position="relative"
        z-index={1}
      >
        <AnimatePresence>
          {childOrder.current
            .map((i) => children[i])
            .filter(Boolean)
            .map((child, i) => (
              <$
                key={child.key}
                $el={motion.div}
                position="absolute"
                top={0}
                left={0}
                width={cardWidth + "rem"}
                height={cardHeight + "rem"}
                initial={{ x: layout[i].x + "rem", y: layout[i].y + "rem", opacity: 0, scale: 0.8 }}
                animate={
                  isShuffling
                    ? {
                        x: width / 2 - cardWidth / 2 + "rem",
                        y: height / 2 - cardHeight / 2 + "rem",
                        opacity: 1,
                        rotate: i * 5 - (5 * children.length) / 2,
                        scale: 1,
                      }
                    : { x: layout[i].x + "rem", y: layout[i].y + "rem", rotate: 0, opacity: 1, scale: 1 }
                }
                exit={{ opacity: 0, scale: 0.8 }}
                $elProps={{ transition: { type: "spring", damping: 100, stiffness: 200 } }}
                {...flexCentered}
              >
                {child}
              </$>
            ))}
        </AnimatePresence>
      </$>
    </$.div>
  );
}
