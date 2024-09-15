import { useEffect, useState } from "react";
import { icons } from "../../constants";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { createBoard, editBoard, getBoards, saveToLocalStorage, selectBoard } from "../../redux/slice";
import { generateHex, generateID } from "../../utilities";
import Button from "../Reusable/Button";
import ModalWrapper from "../Utils/ModalWrapper";

interface Props {
  selectedId?: number;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const INITIAL_COLUMNS: Column[] = [
  {
    id: 43643,
    name: "Todo",
    color: "#000000",
    tasks: [],
  },
  {
    id: 5346,
    name: "On-going",
    color: "#FFFFFF",
    tasks: [],
  },
];

const BoardModal = ({ selectedId, setShowModal }: Props): JSX.Element => {
  const state = useAppSelector(getBoards);
  const dispatch = useAppDispatch();

  const [name, setName] = useState("");
  const [columns, setColumns] = useState(INITIAL_COLUMNS);
  const [nameError, setNameError] = useState("");
  const [columnError, setColumnError] = useState("");

  const handleColumnChange = (id: number, text: string) => {
    setColumns((prev) => prev.map((element) => (element.id === id ? { ...element, name: text } : element)));
  };

  const handleColumnDelete = (id: number) => {
    setColumns((prev) => prev.filter((element) => element.id !== id));
  };

  const handleColumnCreate = () => {
    const column: Column = { id: generateID(5), name: "", tasks: [], color: generateHex() };
    setColumns((prev) => prev.concat(column));
  };

  const handleBoardCreate = () => {
    if (!validate()) {
      resetError();
      return;
    }

    const id = selectedId ? selectedId : generateID(6);
    const board: Board = { id, name, columns };

    if (selectedId) dispatch(editBoard(board));
    else dispatch(createBoard(board));

    dispatch(saveToLocalStorage());
    dispatch(selectBoard(id));
    setShowModal(false);
  };

  const validate = () => {
    const validColumns = columns.every((element) => element.name.length > 0);

    if (name.length === 0) setNameError("Board name cannot be empty!");
    if (!validColumns) setColumnError("Columns names cannot be empty!");

    return !(name.length === 0 || !validColumns);
  };

  const resetError = () => {
    setTimeout(() => {
      setNameError("");
      setColumnError("");
    }, 5000);
  };

  useEffect(() => {
    if (selectedId) {
      const board = state.find((board) => board.id === selectedId)!;
      setName(board.name);
      setColumns(board.columns);
    }
  }, []);

  return (
    <ModalWrapper setShowModal={setShowModal} className="gap-6">
      <h5 className="text-xl font-bold">Add new board</h5>
      <form className="flex flex-col gap-4">
        <div className="modal-inner-container">
          <label className="text-sm font-bold">Board Name</label>
          <input
            value={name}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value)}
            className={`input-element ${nameError ? "error-input" : ""}`}
            type="text"
            placeholder="e.g. Web Development"
          />
          <p className="error-message ">{nameError}</p>
        </div>
        <div className="modal-inner-container">
          <label className="text-sm font-bold">Board Columns</label>
          <div className="modal-scroll-container">
            {columns.length === 0 ? (
              <div className="mb-6">
                <p className="text-text">Add a column to the board!</p>
              </div>
            ) : (
              columns.map(({ id, name }) => (
                <div className="flex gap-4" key={id}>
                  <input
                    value={name}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleColumnChange(id, event.target.value)}
                    className={`input-element flex-1 ${columnError && name.length === 0 ? "error-input" : ""}`}
                    type="text"
                    placeholder="e.g. Todo"
                  />
                  <button type="button" onClick={() => handleColumnDelete(id)} className="rounded p-4 hover:bg-red-200 dark:hover:bg-red-400">
                    <img src={icons.cross} alt="cross icon" />
                  </button>
                </div>
              ))
            )}
          </div>
          <p className="error-message">{columnError}</p>
        </div>
      </form>
      <div className="flex flex-col gap-2">
        <Button handleClick={handleColumnCreate} type="primary" className="!bg-magenta-200 capitalize !text-magenta-400 hover:!bg-green-300 hover:!text-green-700 dark:bg-white">
          <span>+</span> Add new Column
        </Button>
        <Button handleClick={handleBoardCreate} type="primary" className="capitalize">
          {selectedId ? "Save Board" : "Create new board"}
        </Button>
      </div>
    </ModalWrapper>
  );
};

export default BoardModal;
