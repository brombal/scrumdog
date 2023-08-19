import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ButtonBase, ButtonBaseProps, Tooltip, TooltipProps } from "@mui/material";
import $, { StylixProps, useStylixTheme } from "@stylix/core";
import { motion } from "framer-motion";
import React from "react";

interface ButtonProps {
  filled?: boolean;
}

export function IconButton(
  props: Omit<ButtonBaseProps, keyof StylixProps> &
    StylixProps & { icon: IconProp; iconSize?: string; tooltip?: string; tooltipProps?: Partial<TooltipProps> }
) {
  const { icon, iconSize, tooltip, tooltipProps, ...other } = props;

  const TooltipEl = tooltip ? Tooltip : React.Fragment;

  return (
    <TooltipEl {...((tooltip ? { title: tooltip, arrow: true, ...tooltipProps } : {}) as any)}>
      <$
        $el={ButtonBase}
        width="2em"
        height="2em"
        cursor="pointer"
        border-radius="50%"
        transition="background 100ms linear"
        $css={{
          "&:hover": {
            background: "rgba(255, 255, 255, 0.2)",
          },
          "&:disabled": {
            opacity: 0.5,
          },
        }}
        {...other}
      >
        <$ $el={FontAwesomeIcon} font-size={iconSize || "1em"} color="#FFF" icon={icon} />
      </$>
    </TooltipEl>
  );
}

export default function Button({ filled, ...other }: ButtonProps & ButtonBaseProps & StylixProps) {
  const { color } = useStylixTheme();

  return (
    <motion.span whileHover={{ scale: 1.05 }}>
      <$
        $el={ButtonBase}
        display="inline-flex"
        border="3px solid white"
        padding="10px 45px"
        font="inherit"
        font-size="28px"
        font-weight={500}
        border-radius={100}
        background={filled ? "white" : "transparent"}
        color={filled ? color : "white"}
        white-space="nowrap"
        transition="background 100ms linear, color 100ms linear"
        {...(other as any)}
      />
    </motion.span>
  );
}
