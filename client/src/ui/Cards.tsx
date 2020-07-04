import { faCheck } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "@material-ui/core";
import color from "color";
import { AnimatePresence } from "framer-motion";
import React from "react";
import $, { StylixHtmlProps, StylixProps } from "stylix";

import { FlipAnimate, ZoomAnimate } from "@client/util/animations";
import { getInitials, isEmoji, stringLength } from "@client/util/strings";

import { cardRatio } from "./ScrumdogApp";
import { absFullSize, flexCentered } from "./styles";

type PlayerCardProps = {
  size?: number;
  voteCardProps?: StylixProps;
  initialsCardProps?: StylixProps;
} & VoteCardProps &
  InitialsCardProps;

export function PlayerCard({
  size = 1,
  name,
  checked,
  showInitials,
  initialsCardProps = {},
  vote,
  selected,
  voteCardProps = {},
  ...other
}: PlayerCardProps & StylixHtmlProps<"div">) {
  return (
    <Tooltip title={name} placement="top" arrow>
      <$.div
        font-size={`${size}rem`}
        width="2.4em"
        height={2.4 * cardRatio + "em"}
        position="relative"
        user-select="none"
        data-label="PlayerCard"
        perspective={500}
        {...other}
      >
        <AnimatePresence initial={false}>
          {vote ? (
            <FlipAnimate key="vote" reverse {...absFullSize} {...flexCentered}>
              <VoteCard vote={vote} selected={selected} size={size} {...voteCardProps} />
            </FlipAnimate>
          ) : (
            <FlipAnimate key="initials" {...absFullSize} {...flexCentered}>
              <InitialsCard
                showInitials={showInitials}
                name={name}
                size={size}
                checked={checked}
                {...initialsCardProps}
              />
            </FlipAnimate>
          )}
        </AnimatePresence>
      </$.div>
    </Tooltip>
  );
}

///////////

type VoteCardProps = {
  size?: number;
  vote: string;
  selected?: boolean;
};

export function VoteCard({ size = 1, vote, selected = false, ...other }: VoteCardProps & StylixHtmlProps<"span">) {
  return (
    <$.span
      data-label="VoteCard"
      transform={`scale(${selected ? "1.25" : "1"})`}
      border-radius="0.3em"
      border={(theme) => `0.1em solid ${selected ? theme.highlight : "white"}`}
      color="#333"
      font-size={`${size}rem`}
      width="2.4em"
      height={2.4 * cardRatio + "em"}
      font-weight="600"
      user-select="none"
      overflow="hidden"
      background={selected ? "#FFF" : "#DDD"}
      transition="transform 150ms ease-out, border 200ms linear, background 200ms linear"
      z-index={selected ? 1000 : 1}
      position="relative"
      {...other}
    >
      <AnimatePresence initial={false}>
        <ZoomAnimate key={vote} {...absFullSize} {...flexCentered}>
          <$.span font-size={1.7 - 0.2 * stringLength(vote) + "em"}>{vote}</$.span>
        </ZoomAnimate>
      </AnimatePresence>
    </$.span>
  );
}

///////////

type InitialsCardProps = {
  size?: number;
  showInitials: boolean;
  name: string;
  checked: boolean;
};

export function InitialsCard({
  size = 1,
  showInitials,
  name,
  checked,
  ...other
}: InitialsCardProps & StylixHtmlProps<"div">) {
  const initials = getInitials(name).toUpperCase();

  return (
    <$.div
      data-label="InitialsCard"
      font-size={`${size}rem`}
      width="2.4em"
      height={2.4 * cardRatio + "em"}
      border="0.1em solid white"
      background={(theme) => color(theme.color).darken(0.2).string()}
      border-radius="0.3em"
      position="relative"
      {...other}
    >
      <AnimatePresence initial={false}>
        {showInitials && initials ? (
          <ZoomAnimate key={"initials" + initials} {...absFullSize} {...flexCentered}>
            <$.div
              font-size={
                {
                  emoji: ["1.3em", "1em", "0.8em"],
                  text: ["1.5em", "1.2em", "0.8em"],
                }[isEmoji(initials) ? "emoji" : "text"][stringLength(initials) - 1]
              }
              font-weight={500}
              line-height={1.2}
              text-align="center"
              width="100%"
              line-break="anywhere"
            >
              {initials}
            </$.div>
          </ZoomAnimate>
        ) : (
          <ZoomAnimate key="dog" {...absFullSize} {...flexCentered}>
            <$.img src={require("./ajax-white.png").default} opacity={0.4} height="60%" width="auto" />
          </ZoomAnimate>
        )}

        {checked && (
          <ZoomAnimate
            key="check"
            position="absolute"
            top="-0.25em"
            left="-0.25em"
            background="white"
            width="0.8em"
            height="0.8em"
            {...flexCentered}
            border-radius="50%"
            border={(theme) => `0.07em solid ${color(theme.color).darken(0.2).string()}`}
          >
            <$
              $el={FontAwesomeIcon}
              icon={faCheck}
              color={(theme) => theme.color}
              font-size="0.35em"
              margin-top="0.1em"
            />
          </ZoomAnimate>
        )}
      </AnimatePresence>
    </$.div>
  );
}
