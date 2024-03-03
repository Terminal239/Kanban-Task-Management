import { AnimatePresence } from "framer-motion";
import { FC } from "react";
import { createPortal } from "react-dom";

interface Props {
  Component: JSX.Element;
  showModal: boolean;
}

const ModalAnimate: FC<Props> = ({ showModal, Component }) => {
  return createPortal(<AnimatePresence>{showModal && Component}</AnimatePresence>, document.body);
};

export default ModalAnimate;
