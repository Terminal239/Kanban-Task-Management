import { useState } from "react";
import TaskViewModal from "../Modals/TaskViewModal";
import { useDrag } from "react-dnd";
import ModalAnimate from "../Modals/ModalAnimate";

interface Props {
  task: Task;
  columnId: number;
}

const Task = ({ task, columnId }: Props) => {
  const { id, name, subTasks } = task;
  const completed = subTasks.filter((task) => task.completed).length;

  const [showTaskModal, setShowTaskModal] = useState(false);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "Task",
    item: { task, columnId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <>
      <div ref={drag} style={{ display: isDragging ? "none" : "block" }} onClick={() => setShowTaskModal(true)} className="flex flex-col gap-4">
        <article className="task-container group">
          <h4 className="text-base font-bold text-magenta-900 group-hover:text-magenta-400 dark:text-white">{name}</h4>
          <p className="font-bold md:text-[14px]">
            {completed} of {subTasks.length} subtasks
          </p>
        </article>
      </div>
      <ModalAnimate showModal={showTaskModal} Component={<TaskViewModal selectedColumn={columnId} setShowModal={setShowTaskModal} selectedTask={id} />} />
    </>
  );
};

export default Task;
