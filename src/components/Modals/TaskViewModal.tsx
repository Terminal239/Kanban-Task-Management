import ModalWrapper from "../Utils/ModalWrapper";
import Button from "../Reusable/Button";

import { useAppSelector, useAppDispatch } from "../../hooks";
import { icons } from "../../constants";
import { useState } from "react";
import { createTask, deleleTask, editTask, saveToLocalStorage, toggleTaskCompletion } from "../../redux/slice";
import { createPortal } from "react-dom";
import TaskModal from "./TaskModal";
import DeleteModal from "./DeleteModal";

interface Props {
  selectedColumn: number;
  selectedTask: number;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const TaskViewModal = ({ selectedColumn, selectedTask, setShowModal }: Props): JSX.Element => {
  const board = useAppSelector((state) => state.board.selectedBoard!);
  const column: Column = board.columns.find((column) => column.id === selectedColumn)!;
  const task: Task = column.tasks.find((task) => task.id === selectedTask)!;

  const { id, description, name, status, subTasks } = task;
  const completed = subTasks.filter((task) => task.completed).length;

  const dispatch = useAppDispatch();
  const [showDialog, setShowDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setShowDialog(false);
  };

  const handleDeleteClick = () => {
    setIsDeleting(true);
    setShowDialog(false);
  };

  const handleTaskDelete = () => {
    dispatch(deleleTask({ columnId: selectedColumn, taskId: selectedTask }));
    dispatch(saveToLocalStorage());
  };

  const handleStatusChange = (status: number, id: number) => {
    const task: Task = { id, name, description, status, subTasks };
    if (selectedTask && status === selectedColumn) {
      dispatch(editTask(task));
      return;
    }

    dispatch(deleleTask({ taskId: task.id, columnId: selectedColumn }));
    dispatch(createTask(task));
    dispatch(saveToLocalStorage());
  };

  const handleSubTaskCheckToggle = (subTaskId: number, taskId: number, columnId: number) => {
    dispatch(toggleTaskCompletion({ columnId, taskId, subTaskId }));
    dispatch(saveToLocalStorage());
  };

  return (
    <ModalWrapper setShowModal={setShowModal} additionalClasses="gap-0">
      <div className="flex items-center justify-between">
        <p className="text-xl font-bold">{name}</p>
        <div className="relative flex items-center text-text">
          <button onClick={() => setShowDialog((prev) => !prev)} className="button-ellipsis">
            <img src={icons.verticalEllipsis} alt="vertical ellipsis" className="object-contain" />
          </button>
          {showDialog && (
            <div className="dialog-box">
              <Button handleClick={handleEdit} type="text" additionalClasses={"text-gray-gray font-bold hover:text-gray-600 hover:bg-gray-400"}>
                Edit Task
              </Button>
              <Button handleClick={handleDeleteClick} type="text" additionalClasses={"text-red-400 font-bold hover:text-red-600 hover:bg-red-300"}>
                Delete Task
              </Button>
            </div>
          )}
        </div>
      </div>
      <p className="mb-6">{description}</p>
      <div className="mb-6 flex flex-col gap-3">
        <p className="element-label">
          Subtasks ({completed} of {subTasks.length})
        </p>
        <ul className="modal-scroll-container">
          {subTasks.map(({ id, name, completed }) => (
            <li key={id} className={`flex items-center gap-4 rounded bg-magenta-200 px-4 py-3 dark:bg-magenta-800 ${completed ? "line-through" : ""}`}>
              <button
                onClick={() => handleSubTaskCheckToggle(id, selectedTask!, selectedColumn!)}
                className={`flex size-4 items-center justify-center  ${completed ? "bg-magenta-400" : "bg-lightGray dark:bg-magenta-700"}`}
              >
                {completed && <img src={icons.check} className="" />}
              </button>
              {name}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <div className="relative flex flex-col gap-2">
          <p className="element-label">Status</p>
          <select className="select-element" value={status} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => handleStatusChange(+event.target.value, id)}>
            {board?.columns.map(({ id, name }) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {isEditing && createPortal(<TaskModal selectedColumn={selectedColumn} selectedTask={selectedTask} setShowModal={setIsEditing} />, document.body)}
      {isDeleting && createPortal(<DeleteModal setShowModal={setIsDeleting} element="task" handleDelete={handleTaskDelete} name={name} />, document.body)}
    </ModalWrapper>
  );
};

export default TaskViewModal;
