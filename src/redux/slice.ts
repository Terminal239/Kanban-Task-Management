import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";
// import { generateHex } from "../../utilities";

// const generateSubTasks = (count: number): SubTask[] => {
//   const subTasks: SubTask[] = [];
//   for (let i = 1; i <= count; i++) {
//     subTasks.push({
//       id: i,
//       name: `SubTask ${i}`,
//       completed: Math.random() < 0.5,
//     });
//   }
//   return subTasks;
// };

// const generateTasks = (count: number, columnId: number): Task[] => {
//   const tasks: Task[] = [];
//   for (let i = 1; i <= count; i++) {
//     tasks.push({
//       id: i,
//       status: columnId,
//       name: `Task ${i}`,
//       description: `Description for Task ${i}`,
//       subTasks: generateSubTasks(Math.floor(Math.random() * 16) + 1),
//     });
//   }
//   return tasks;
// };

// const generateColumns = (count: number): Column[] => {
//   const columns: Column[] = [];
//   for (let i = 1; i <= count; i++) {
//     columns.push({
//       id: i,
//       color: generateHex(),
//       name: `Column ${i}`,
//       tasks: generateTasks(Math.floor(Math.random() * 15) + 1, i),
//     });
//   }
//   return columns;
// };

// const generateBoards = (count: number): Board[] => {
//   const boards: Board[] = [];
//   for (let i = 1; i <= count; i++) {
//     boards.push({
//       id: i,
//       name: `Board ${i}`,
//       columns: generateColumns(8),
//     });
//   }
//   return boards;
// };

interface BoardState {
  boards: Board[];
  selectedBoard: Board | null;
}

const DUMMY_DATA: Board[] = [
  {
    id: 1,
    name: "Project X",
    columns: [
      {
        id: 1,
        color: "#FF5733",
        name: "To Do",
        tasks: [
          {
            id: 1,
            status: 1,
            name: "Task 1",
            description: "Implement feature A",
            subTasks: [
              { id: 1, name: "Subtask 1", completed: false },
              { id: 2, name: "Subtask 2", completed: true },
            ],
          },
          {
            id: 2,
            status: 1,
            name: "Task 2",
            description: "Fix bug in module B",
            subTasks: [],
          },
        ],
      },
      {
        id: 2,
        color: "#33FF57",
        name: "In Progress",
        tasks: [
          {
            id: 3,
            status: 2,
            name: "Task 3",
            description: "Refactor codebase",
            subTasks: [{ id: 3, name: "Subtask 1", completed: false }],
          },
        ],
      },
      {
        id: 3,
        color: "#5733FF",
        name: "Done",
        tasks: [
          {
            id: 4,
            status: 3,
            name: "Task 4",
            description: "Write documentation",
            subTasks: [],
          },
        ],
      },
    ],
  },
];

const initialState: BoardState = {
  boards: [],
  selectedBoard: null,
};

const boardSlice = createSlice({
  name: "kanban-board",
  initialState,
  reducers: {
    createBoard: (state, action: PayloadAction<Board>) => {
      state.boards.push(action.payload);
    },
    editBoard: (state, action: PayloadAction<Board>) => {
      const edited = action.payload;
      state.boards = state.boards.map((board) => (board.id === edited.id ? edited : board));
    },
    deleteBoard: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      state.boards = state.boards.filter((board) => board.id !== id);
    },
    selectBoard: (state, action: PayloadAction<number | null>) => {
      const id = action.payload;
      state.selectedBoard = state.boards.find((board) => board.id === id)!;
    },
    createTask: (state, action: PayloadAction<Task>) => {
      const columnId = action.payload.status;
      const selectedColumn: Column = state.selectedBoard!.columns.find((column) => column.id === columnId)!;
      selectedColumn.tasks.push(action.payload);

      state.selectedBoard!.columns = state.selectedBoard!.columns.map((column) => (column.id === columnId ? selectedColumn : column));
      state.boards = state.boards.map((board) => (board.id === state.selectedBoard?.id ? state.selectedBoard! : board));
    },
    deleleTask: (state, action: PayloadAction<{ columnId: number; taskId: number }>) => {
      const { columnId, taskId } = action.payload;
      const selectedColumn: Column = state.selectedBoard!.columns.find((column) => column.id === columnId)!;
      selectedColumn.tasks = selectedColumn.tasks.filter((task) => task.id !== taskId);

      state.selectedBoard!.columns = state.selectedBoard!.columns.map((column) => (column.id === columnId ? selectedColumn : column));
      state.boards = state.boards.map((board) => (board.id === state.selectedBoard?.id ? state.selectedBoard! : board));
    },
    editTask: (state, action: PayloadAction<Task>) => {
      const edited = action.payload;
      const { status: columnId, id: taskId } = action.payload;

      const selectedColumn: Column = state.selectedBoard!.columns.find((column) => column.id === columnId)!;
      selectedColumn.tasks = selectedColumn.tasks.map((task) => (task.id === taskId ? edited : task));

      state.selectedBoard!.columns = state.selectedBoard!.columns.map((column) => (column.id === columnId ? selectedColumn : column));
      state.boards = state.boards.map((board) => (board.id === state.selectedBoard?.id ? state.selectedBoard : board));
    },
    toggleTaskCompletion: (state, action: PayloadAction<{ columnId: number; taskId: number; subTaskId: number }>) => {
      const { columnId, taskId, subTaskId } = action.payload;
      const selectedColumn: Column = state.selectedBoard!.columns.find((column) => column.id === columnId)!;
      const selectedTask: Task = selectedColumn.tasks.find((task) => task.id === taskId)!;
      const found: SubTask = selectedTask.subTasks.find((subTask) => subTask.id === subTaskId)!;
      const toggled: SubTask = { ...found, completed: !found?.completed };

      selectedTask.subTasks = selectedTask.subTasks.map((subTask) => (subTask.id === subTaskId ? toggled : subTask));
      selectedColumn.tasks = selectedColumn.tasks.map((task) => (task.id === taskId ? selectedTask : task));

      state.selectedBoard!.columns = state.selectedBoard!.columns.map((column) => (column.id === columnId ? selectedColumn : column));
      state.boards = state.boards.map((board) => (board.id === state.selectedBoard?.id ? state.selectedBoard : board));
    },
    saveToLocalStorage: (state) => {
      localStorage.setItem("data", JSON.stringify(state.boards));
    },
    getFromLocalStorage: (state) => {
      const data = localStorage.getItem("data");
      if (!data) {
        state.boards = DUMMY_DATA;
        state.selectedBoard = DUMMY_DATA[0];
        localStorage.setItem("data", JSON.stringify(state.boards));
        return;
      }

      const boards: Board[] = JSON.parse(data);
      state.boards = boards;
      state.selectedBoard = boards[0];
    },
  },
});

export const { createBoard, selectBoard, editBoard, deleteBoard, createTask, editTask, deleleTask, toggleTaskCompletion, getFromLocalStorage, saveToLocalStorage } =
  boardSlice.actions;
export const selectCount = (state: RootState) => state.board.boards;
export default boardSlice.reducer;
