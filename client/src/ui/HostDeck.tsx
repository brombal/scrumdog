import { AnimatePresence, motion } from "framer-motion";
import React from "react";

import { store, toggleDeckCard } from "client/scrum";
import $, { StylixProps } from "@stylix/core";
import useLatestValue from "client/util/useLatestValue";
import { decks } from "server/shared/values";
import { isEmoji, stringLength } from "client/util/strings";

interface HostDeckProps {
  visible: boolean;
  half: boolean;
}

export default function HostDeck({ visible, half, ...other }: HostDeckProps & StylixProps) {
  const _deck = store.useState((s) => s.room?.deck);
  const deck = useLatestValue(_deck);

  return (
    <AnimatePresence>
      {visible && (
        <$
          data-label="HostDeck"
          $el={motion.div}
          animate={half ? "half" : "full"}
          variants={{
            full: { translateY: 0, scale: 0.8 },
            half: { translateY: 35, scale: 0.8 },
          }}
          initial={{ translateY: "100%", scale: 0.8 }}
          exit={{ translateY: "100%", scale: 0.8 }}
          whileHover={{ scale: 1, translateY: 0 }}
          $elProps={{
            transition: {
              scale: { type: "spring", damping: 30, stiffness: 450 },
              translateY: { type: "spring", damping: 30, stiffness: 450 },
            },
          }}
          transform-origin="50% 100%"
          display="flex"
          justify-content="center"
          padding-top={30}
          {...other}
        >
          <$.div
            background="rgba(255, 255, 255, 0.3)"
            border-radius="10px 10px 0px 0px"
            display="flex"
            padding="3px 8px 5px"
          >
            {decks.scrum.map(([value], i) => (
              <$ key={value} $selector="&:hover" background="linear-gradient(150deg, hsl(0, 0%, 90%), hsl(0, 0%, 75%))">
                <$
                  $selector="&"
                  $disabled={!deck?.includes(value)}
                  box-shadow="inset 0 0 0 3px #FFF, 0 0 8px rgba(0,0,0,0.2)"
                  background="linear-gradient(150deg, hsl(0, 0%, 95%), hsl(0, 0%, 80%))"
                  z-index={100 - i}
                >
                  <$
                    $el={motion.span}
                    animate={deck?.includes(value) ? "selected" : "unselected"}
                    variants={{
                      unselected: {
                        translateY: 0,
                        rotate: "0deg",
                        scale: 0.9,
                      },
                      selected: {
                        translateY: "-40%",
                        rotate: "1deg",
                        scale: 1,
                      },
                    }}
                    z-index={0}
                    position="relative"
                    margin="0 -1px"
                    border-radius={8}
                    color="#333"
                    width={48}
                    height={64}
                    display="flex"
                    align-items="center"
                    justify-content="center"
                    font-weight="600"
                    onClick={() => toggleDeckCard(value)}
                    font-size={isEmoji(value) ? "26pt" : 26 - stringLength(value) * 3 + "pt"}
                    cursor="pointer"
                    user-select="none"
                    overflow="hidden"
                    box-shadow="inset 0 0 0 3px #CCC, 0 0 3px rgba(0,0,0,0)"
                    background="linear-gradient(150deg, hsl(0, 0%, 80%), hsl(0, 0%, 65%))"
                    transition="box-shadow 150ms linear, background 150ms linear"
                  >
                    {value}
                  </$>
                </$>
              </$>
            ))}
          </$.div>
        </$>
      )}
    </AnimatePresence>
  );
}
