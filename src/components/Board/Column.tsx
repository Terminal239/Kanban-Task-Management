import Task from "./Task";

interface Props {
  column: Column;
}

const Column = ({ column }: Props) => {
  const { id, name, tasks, color } = column;

  return (
    <div className="flex min-w-[256px] flex-col gap-6 md:min-w-[296px] ">
      <div className="flex items-center gap-4">
        <div className="size-4 rounded-full" style={{ backgroundColor: color }}></div>
        <h3 className="font-bold uppercase tracking-[4px] text-text md:text-sm">
          {name} ({tasks.length})
        </h3>
      </div>
      <div className="flex flex-1 flex-col gap-4">
        {tasks.length === 0 ? (
          <p className="font-bold text-magenta-900 dark:text-lightGray md:text-base">Add a task to this column!</p>
        ) : (
          tasks.map((task: Task) => <Task columnId={id} key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
};

export default Column;
