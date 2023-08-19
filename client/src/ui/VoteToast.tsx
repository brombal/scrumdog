import { Modal } from "@mui/material";
import { AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";
import $ from "@stylix/core";

import { absCentered, flexCentered } from "client/ui/styles";
import { ZoomAnimate } from "client/util/animations";
import { delay } from "server/shared/util";

type VoteToastProps = {
  open: boolean;
};

export default function VoteToast({ open }: VoteToastProps) {
  return (
    <Modal open={open} BackdropComponent={() => null}>
      <VoteToastContent in={open} />
    </Modal>
  );
}

type VoteToastContentProps = {
  in: boolean;
  onEnter?(): void;
  onExited?(): void;
};

const VoteToastContent = React.forwardRef(function VoteModal(
  props: VoteToastContentProps,
  ref: React.RefObject<HTMLDivElement>
) {
  const [show, setShow] = useState(props.in);
  useEffect(() => {
    if (props.in) {
      props.onEnter();
      setShow(true);
    } else {
      (async () => {
        setShow(false);
        await delay(0.5);
        props.onExited();
      })();
    }
  }, [props.in]);

  return (
    <$.div {...absCentered} {...flexCentered} ref={ref} tabIndex={-1} outline="none">
      <AnimatePresence>
        {show && (
          <ZoomAnimate exitForward scale={0.7}>
            <$.div
              {...flexCentered}
              background="rgba(0, 0, 0, 0.8)"
              color="white"
              width="4em"
              max-width="90vw"
              height="2em"
              border-radius="0.25em"
              font-size="2rem"
              font-weight={600}
              letter-spacing="-0.06em"
              user-select="none"
            >
              VOTE!
            </$.div>
          </ZoomAnimate>
        )}
      </AnimatePresence>
    </$.div>
  );
});
