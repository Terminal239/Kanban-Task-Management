import { useWindowSize } from "@uidotdev/usehooks";
import { useState } from "react";

import BoardModal from "../Modals/BoardModal";
import TaskModal from "../Modals/TaskModal";
import Button from "../Reusable/Button";

import { AnimatePresence, motion } from "framer-motion";
import { icons } from "../../constants";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { deleteBoard, getBoards, getSelectedBoard, saveToLocalStorage, selectBoard } from "../../redux/slice";
import DeleteModal from "../Modals/DeleteModal";
import ModalAnimate from "../Modals/ModalAnimate";

interface Props {
  theme: string;
  showSidebar: boolean;
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}

const TopBar = ({ theme, showSidebar, setShowSidebar }: Props) => {
  const dispatch = useAppDispatch();
  const boards = useAppSelector(getBoards);
  const selectedBoard = useAppSelector(getSelectedBoard);
  const { width } = useWindowSize();
  const [showDialog, setShowDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  if (!selectedBoard) return;

  const { id, name }: Board = selectedBoard!;

  const handleEditClick = () => {
    setIsEditing(true);
    setShowDialog(false);
  };

  const handleDelete = () => {
    setIsDeleting(true);
    setShowDialog(false);
  };

  const handleBoardDelete = () => {
    const filtered = boards.filter((board) => board.id !== id);
    const selected = filtered[0];
    dispatch(deleteBoard(id));

    if (!selected) dispatch(selectBoard(null));
    else dispatch(selectBoard(selected.id));

    dispatch(saveToLocalStorage());
    setShowDialog(false);
  };

  const handleAddNewTask = () => {
    setIsCreatingTask(true);
  };

  return (
    <header className="header">
      <div className="logo-container">
        <img src={width! < 768 ? icons.logoMobile : theme === "dark" ? icons.logoLight : icons.logoDark} alt="logo of the application" className="object-contain" />
      </div>
      <div className="flex flex-1 justify-between md:pl-6">
        <div className="flex items-center gap-2">
          <h2 className="font-bold leading-[48px] dark:text-white md:text-[24px]">{name}</h2>
          {width! < 768 && (
            <button className="mt-1" onClick={() => setShowSidebar((prev) => !prev)}>
              <img className="w-3" src={showSidebar ? icons.chevronUp : icons.chevronDown} alt="chevron icon" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Button handleClick={handleAddNewTask} type="primary" className="flex items-center gap-2">
            <img src={icons.addTaskMobile} alt="Plus icon" className="mt-0.5 leading-none" />
            {width! >= 768 && "Add new task"}
          </Button>
          <div className="relative flex items-center text-text">
            <button onClick={() => setShowDialog((prev) => !prev)} className="button-ellipsis">
              <img src={icons.verticalEllipsis} alt="vertical ellipsis" className="object-contain" />
            </button>
            <AnimatePresence>
              {showDialog && (
                <motion.div
                  initial={{ opacity: 0, y: "15%" }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: "15%" }}
                  transition={{ bounce: 0, duration: 0.1 }}
                  className="dialog-box"
                >
                  <Button handleClick={handleEditClick} type="text" className={"text-gray-gray font-bold hover:bg-gray-400 hover:text-gray-600"}>
                    Edit Board
                  </Button>
                  <Button handleClick={handleDelete} type="text" className={"font-bold text-red-400 hover:bg-red-300 hover:text-red-600"}>
                    Delete Board
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <ModalAnimate showModal={isEditing} Component={<BoardModal setShowModal={setIsEditing} selectedId={id} />} />
      <ModalAnimate showModal={isCreatingTask} Component={<TaskModal setShowModal={setIsCreatingTask} />} />
      <ModalAnimate showModal={isDeleting} Component={<DeleteModal setShowModal={setIsDeleting} element="board" handleDelete={handleBoardDelete} name={name} />} />
    </header>
  );
};

export default TopBar;
