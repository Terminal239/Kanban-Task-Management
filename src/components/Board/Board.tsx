import { useAppDispatch, useAppSelector } from "../../hooks";
import { editBoard, saveToLocalStorage, selectBoard } from "../../redux/slices/boardSlice";
import { generateID, generateHex } from "../../utilities";
import Column from "./Column";

const Board = () => {
  const selectedBoard = useAppSelector((state) => state.board.selectedBoard);
  const dispatch = useAppDispatch();

  const handleCreateColumn = () => {
    const column: Column = { id: generateID(5), name: "New Column", tasks: [], color: generateHex() };
    const columns = selectedBoard!.columns.concat(column)!;
    const board: Board = { ...selectedBoard!, columns };
    dispatch(editBoard(board));
    dispatch(saveToLocalStorage());
    dispatch(selectBoard(board.id));
  };

  return (
    <div className="flex flex-1 grow flex-col overflow-x-auto px-4 py-6 text-[12px] md:p-6">
      <div className="mr-4 flex grow gap-4 md:gap-6">
        {selectedBoard?.columns.map((column) => <Column key={column.id} column={column} />)}
        <button onClick={handleCreateColumn} className="btn-create-column">
          <span className="mb-1 mr-2 md:-ml-2">+</span> <span>New Column</span>
        </button>
      </div>
    </div>
  );
};

export default Board;
