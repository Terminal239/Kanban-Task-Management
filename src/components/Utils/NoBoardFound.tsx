import { useState } from "react";
import Button from "../Reusable/Button";
import CreateNewBoardModal from "../Modals/BoardModal";

const NoBoardFound = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="flex size-full items-center justify-center bg-white dark:bg-magenta-700">
        <div className="flex w-[75%] flex-col items-center rounded-md bg-white p-8 shadow dark:bg-magenta-800 md:max-w-[512px]">
          <p className="mb-8 text-center text-2xl font-bold text-magenta-900 dark:text-white">No boards found. Create a board to add tasks!</p>
          <Button handleClick={() => setShowModal(true)} type="primary">
            Create
          </Button>
        </div>
      </div>
      {showModal && <CreateNewBoardModal setShowModal={setShowModal} />}
    </>
  );
};

export default NoBoardFound;
