import { useEffect, useState } from "react";
import ModalWrapper from "../Utils/ModalWrapper";
import Button from "../Reusable/Button";

import { useAppSelector, useAppDispatch } from "../../hooks";
import { generateID } from "../../utilities";
import { icons } from "../../constants";
import { createTask, deleleTask, editTask, saveToLocalStorage } from "../../redux/slice";

interface Props {
  selectedColumn?: number;
  selectedTask?: number;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const INITIAL_SUBTASKS: SubTask[] = [
  {
    id: 43643,
    name: "Complete the project",
    completed: false,
  },
  {
    id: 5346,
    name: "Write the research paper",
    completed: false,
  },
];

const TaskModal = ({ selectedColumn, selectedTask, setShowModal }: Props): JSX.Element => {
  const board = useAppSelector((state) => state.board.selectedBoard!);
  const dispatch = useAppDispatch();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subTasks, setSubTasks] = useState(INITIAL_SUBTASKS);
  const [status, setStatus] = useState(0);

  const [nameError, setNameError] = useState("");
  const [subTaskError, setSubTaskError] = useState("");
  const [statusError, setStatusError] = useState("");

  const handleSubTaskChange = (id: number, text: string) => {
    setSubTasks((prev) => prev.map((element) => (element.id === id ? { ...element, name: text } : element)));
  };

  const handleSubTaskDelete = (id: number) => {
    setSubTasks((prev) => prev.filter((element) => element.id !== id));
  };

  const handleSubTaskCreate = () => {
    const subTask: SubTask = { id: generateID(5), name: "", completed: false };
    setSubTasks((prev) => prev.concat(subTask));
  };

  const handleStatusChange = (status: number, id: number) => {
    const task: Task = { id, name, description, status, subTasks };
    if (selectedTask && status === selectedColumn) {
      dispatch(editTask(task));
      dispatch(saveToLocalStorage());
      return;
    }

    if (selectedColumn) {
      dispatch(deleleTask({ taskId: task.id, columnId: selectedColumn! }));
    }

    dispatch(createTask(task));
    dispatch(saveToLocalStorage());
  };

  const handleTaskCreate = () => {
    if (!validate()) {
      resetError();
      return;
    }

    const id = selectedTask ? selectedTask : generateID(6);
    handleStatusChange(status, id);
    setShowModal(false);
  };

  const validate = () => {
    const validSubTasks = subTasks.every((element) => element.name.length > 0);

    if (name.length === 0) setNameError("Task name cannot be empty!");
    if (!validSubTasks) setSubTaskError("Subtasks cannot be empty!");
    if (status === 0) setStatusError("Select a status!");

    return !(name.length === 0 || !validSubTasks || status === 0);
  };

  const resetError = () => {
    setTimeout(() => {
      setNameError("");
      setSubTaskError("");
      setStatusError("");
    }, 5000);
  };

  useEffect(() => {
    if (selectedTask) {
      const columns = board.columns.find((column) => column.id === selectedColumn)!;
      const task = columns.tasks.find((task) => task.id === selectedTask)!;

      setName(task.name);
      setDescription(task.description);
      setSubTasks(task.subTasks);
      setStatus(task.status);
    }
  }, []);

  return (
    <ModalWrapper setShowModal={setShowModal} additionalClasses="gap-6">
      <h5 className="text-xl font-bold">Add new board</h5>
      <form className="flex flex-col gap-4">
        <div className="modal-inner-container">
          <label className="text-sm font-bold">Task Name</label>
          <input
            value={name}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value)}
            className={`input-element ${nameError ? "error-input" : ""}`}
            type="text"
            placeholder="e.g. Start learning things"
          />
          <p className="error-message ">{nameError}</p>
        </div>
        <div className="modal-inner-container">
          <label className="text-sm font-bold">Description (Optional)</label>
          <textarea
            value={description}
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(event.target.value)}
            className={`input-element`}
            placeholder="e.g. Start learning things"
          />
        </div>
        <div className="modal-inner-container">
          <label className="text-sm font-bold">Subtasks</label>
          <div className="modal-scroll-container">
            {subTasks.length === 0 ? (
              <div className="mb-6">
                <p className="text-text">Add a task to the column!</p>
              </div>
            ) : (
              subTasks.map(({ id, name }) => (
                <div className="flex gap-4" key={id}>
                  <input
                    value={name}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleSubTaskChange(id, event.target.value)}
                    className={`input-element flex-1 ${subTaskError && name.length === 0 ? "error-input" : ""}`}
                    type="text"
                    placeholder="e.g. Todo"
                  />
                  <button type="button" onClick={() => handleSubTaskDelete(id)} className="rounded p-2 hover:bg-red-200 dark:hover:bg-red-400 md:p-4">
                    <img src={icons.cross} alt="cross icon" />
                  </button>
                </div>
              ))
            )}
          </div>
          <Button
            inForm={false}
            handleClick={handleSubTaskCreate}
            type="primary"
            additionalClasses="capitalize !bg-magenta-200 dark:bg-white !text-magenta-400 hover:!bg-green-300 hover:!text-green-700"
          >
            <span>+</span> Add Subtask
          </Button>
          <p className="error-message">{subTaskError}</p>
        </div>
        <div className="modal-inner-container">
          <label className="text-sm font-bold">Status</label>
          <select
            className={`select-element ${statusError ? "error-input" : ""}`}
            value={status}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setStatus(+event.target.value)}
          >
            <option value={0}>Select a status</option>
            {board?.columns.map(({ id, name }) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
          <p className="error-message">{statusError}</p>
        </div>
      </form>
      <div className="flex flex-col gap-2">
        <Button handleClick={handleTaskCreate} type="primary" additionalClasses="capitalize">
          {selectedTask ? "Save task" : "Create task"}
        </Button>
      </div>
    </ModalWrapper>
  );
};

export default TaskModal;
