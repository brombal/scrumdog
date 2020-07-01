import { ButtonBase, ButtonBaseProps } from "@material-ui/core";
import { motion } from "framer-motion";
import React from "react";
import $, { StylixProps, useStylixThemeContext } from "stylix";

interface ButtonProps {
  filled?: boolean;
}

export default function Button({ filled, ...other }: ButtonProps & ButtonBaseProps & StylixProps) {
  const {
    theme: { color },
  } = useStylixThemeContext();

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
