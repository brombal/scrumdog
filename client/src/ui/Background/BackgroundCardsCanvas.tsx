import interpolate from "color-interpolate";
import { remove } from "lodash-es";
import { useCallback, useEffect, useRef } from "react";
import React from "react";
import ReactResizeDetector from "react-resize-detector";
import $, { StylixProps, useStylixThemeContext } from "stylix";
import Two from "two.js";

import { deg2rad } from "@client/util/math";

export default function BackgroundCardsCanvas(p: StylixProps) {
  const ref = useRef<HTMLDivElement>();

  const {
    theme: { color },
  } = useStylixThemeContext();

  const cardCount = 30;
  const angle = deg2rad(-30);
  const speedAdjust = 0.5;
  let cardHeight = 0; // calculated by clientWidth
  const cardHeightWindowRatio = 0.15;

  const twoRef = useRef<Two>(null);

  function initialize() {
    if (twoRef.current) return;

    cardHeight = ref.current.clientWidth * cardHeightWindowRatio;

    const yOverflow = (cardHeight / 2) * 1.4; // half the height plus a little bit because the card is rotated; there is probably a formula for this
    const heightTan = -Math.tan(angle) * ref.current.clientHeight;

    twoRef.current = new Two({
      autostart: true,
      type: Two.Types.svg,
      width: ref.current.clientWidth,
      height: ref.current.clientHeight,
    });
    twoRef.current.appendTo(ref.current);

    const group = twoRef.current.makeGroup();

    function generateCard() {
      const distance = Math.random() * 0.7 + 0.3;
      const card = {
        x: Math.random() * (ref.current.clientWidth + heightTan) - heightTan,
        distance,
        y: -yOverflow * distance,
        rect: twoRef.current.makeRoundedRectangle(0, 0, cardHeight / 1.4, cardHeight, 10),
      };

      card.rect.fill = interpolate([color, "#FFF"])(card.distance);
      card.rect.rotation = angle;
      card.rect.scale = card.distance;
      card.rect.translation = new Two.Vector(100, 100);
      card.rect.noStroke();
      (card.rect as any).distance = distance;

      group.add(card.rect);
      group.children.sort((a: any, b: any) => a.distance - b.distance);

      return card;
    }

    // Initialize cards
    const cards = [...Array(cardCount)].fill(null).map(() => {
      const card = generateCard();
      card.y = (ref.current.clientHeight + yOverflow * 2 - yOverflow) * Math.random();
      return card;
    });

    // Animate
    twoRef.current.bind("update", () => {
      remove(cards, (c) => !c.rect);
      while (cards.length < cardCount) {
        cards.push(generateCard());
      }

      for (const i in cards) {
        const card = cards[i];
        card.x += -Math.tan(angle) * card.distance * speedAdjust;
        card.y += card.distance * speedAdjust;
        card.rect.translation = new Two.Vector(card.x, card.y);

        if (card.y >= ref.current.clientHeight + yOverflow) {
          card.rect.remove();
          card.rect = null;
        }
      }
    });
  }

  useEffect(() => {
    return () => {
      twoRef.current.pause();
      ref.current.removeChild(ref.current.childNodes[0]);
    };
  }, []);

  const handleResize = useCallback((w, h) => {
    if (ref.current?.clientHeight) initialize();
    if (twoRef.current) {
      twoRef.current.width = ref.current.clientWidth;
      twoRef.current.height = ref.current.clientHeight;
    }
  }, []);

  return (
    <$.div position="relative" data-label="BackgroundCardsCanvas" {...p}>
      <$.div ref={ref} position="absolute" top={0} left={0} width="100%" height="100%" opacity={0.1} />
      <ReactResizeDetector handleHeight handleWidth onResize={handleResize} />
    </$.div>
  );
}
