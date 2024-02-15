import { useState } from "react";
import { createPortal } from "react-dom";

import CreateNewBoardModal from "../Modals/BoardModal";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { icons } from "../../constants";
import { selectBoard } from "../../redux/slices/boardSlice";
import { useWindowSize } from "@uidotdev/usehooks";

interface Props {
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  handleThemeSwitch: () => void;
}

const Sidebar = ({ setShowSidebar, handleThemeSwitch }: Props) => {
  const { width } = useWindowSize();
  const state = useAppSelector((state) => state.board.boards);
  const dispatch = useAppDispatch();

  const [showModal, setShowModal] = useState(false);

  const handleBoardSelect = (id: number) => {
    dispatch(selectBoard(id));
  };

  return (
    <>
      <aside className="absolute left-[50%] flex w-[85%] translate-x-[-50%] translate-y-4 flex-col rounded-lg border-r-lightGray bg-white px-6 py-4 shadow-lg dark:border-[#495057] dark:bg-magenta-700 md:static md:basis-[256px] md:translate-x-0 md:translate-y-0 md:rounded-none md:border-r md:shadow-none">
        <p className="mb-4 text-[12px] font-bold uppercase tracking-[4px] text-text">All boards ({state.length})</p>
        <div className="flex max-h-[320px] flex-col gap-2 overflow-x-auto md:-ml-6 md:mb-8 md:max-h-full">
          {state.map(({ id, name }) => (
            <button
              onClick={() => handleBoardSelect(id)}
              role="button"
              key={id}
              className="group flex cursor-pointer items-center gap-4 rounded py-3 pl-6 transition-all hover:bg-gray-200 md:rounded-r-full"
            >
              <img src={icons.board} alt="icon of a board" />
              <span className="font-bold text-text group-hover:text-magenta-400">{name}</span>
            </button>
          ))}
          <button
            onClick={() => setShowModal((prev) => !prev)}
            className="flex cursor-pointer items-center gap-4 rounded py-3 pl-6 text-magenta-400 transition-all hover:bg-gray-200 md:rounded-r-full"
          >
            <img src={icons.board} alt="icon of a board" />
            <div className="flex items-center gap-1 font-bold">
              <span className="mb-0.5">+</span>
              <span>Create New Board</span>
            </div>
          </button>
        </div>
        <div className="mb-2 mt-8 flex items-center justify-center gap-4 rounded-lg bg-magenta-200 p-2 dark:bg-magenta-800 md:mt-auto md:gap-6 md:p-4">
          <img src={icons.dark} alt={"icon of the moon"} />
          <button onClick={handleThemeSwitch} className="flex h-6 w-12 justify-end rounded-full bg-magenta-400 p-1 dark:justify-start">
            <div className="size-4 rounded-full bg-white"></div>
          </button>
          <img src={icons.light} alt={"icon of the sun"} />
        </div>
        {width! >= 768 && (
          <button
            className={`group relative -ml-6 mb-6 flex cursor-pointer items-center gap-4 rounded-r-full py-3 pl-6 font-bold text-text transition-all hover:bg-gray-200`}
            onClick={() => setShowSidebar((prev) => !prev)}
          >
            <img src={icons.hideSidebar} className="mt-1" alt="icon of an crossed out eye" /> Hide Sidebar
          </button>
        )}
      </aside>
      {showModal && createPortal(<CreateNewBoardModal setShowModal={setShowModal} />, document.body)}
    </>
  );
};

export default Sidebar;
