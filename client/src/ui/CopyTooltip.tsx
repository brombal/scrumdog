import { Tooltip, TooltipProps } from "@material-ui/core";
import copy from "copy-to-clipboard";
import React, { useCallback, useState } from "react";

import $ from "stylix";

export default function CopyTooltip(props: { url: string } & TooltipProps) {
  const [copied, setCopied] = useState(false);

  const handleClickCopyLink = useCallback(() => {
    copy(props.url);
    setCopied(true);
  }, [props.url]);

  return (
    <$
      $el={Tooltip}
      arrow
      onClick={handleClickCopyLink}
      cursor="pointer"
      onMouseEnter={() => setCopied(false)}
      {...props}
      title={
        <$.div width="6em" text-align="center">
          {copied ? "Copied!" : props.title}
        </$.div>
      }
    />
  );
}
