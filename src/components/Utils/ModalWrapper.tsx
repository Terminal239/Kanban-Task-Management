import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const ModalWrapper = ({ className, children, setShowModal }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
      className="absolute inset-0 z-40 flex size-full items-center justify-center p-4 text-text md:p-0 "
    >
      <div onClick={() => setShowModal(false)} className="absolute size-full bg-black/25"></div>
      <div className={`z-50 flex w-[350px] flex-col rounded-lg bg-white p-4 text-sm text-magenta-900 dark:bg-magenta-700 dark:text-white md:w-[512px] md:p-6 ${className}`}>
        {children}
      </div>
    </motion.div>
  );
};

export default ModalWrapper;
