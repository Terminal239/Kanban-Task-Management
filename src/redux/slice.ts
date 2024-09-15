import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { getBoardData } from "./thunk";
interface BoardState {
  boards: Board[];
  selectedBoard: Board | null;
  uid: string | null;
  status: string;
}

export const DUMMY_DATA: Board[] = [
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
  uid: null,
  status: "",
};

const boardSlice = createSlice({
  name: "kanban-board",
  initialState,
  reducers: {
    createBoard: (state, action: PayloadAction<Board>) => {
      state.boards.push(action.payload);
      state.selectedBoard = action.payload;
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
    initialize: (state, action) => {
      state.boards = action.payload;
      state.selectedBoard = action.payload[0];
    },
    setUser: (state, action: PayloadAction<string>) => {
      state.boards = [];
      state.selectedBoard = null;
      state.uid = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getBoardData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getBoardData.fulfilled, (state, action) => {
        state.status = "succeeded";
        console.log(action);
      })
      .addCase(getBoardData.rejected, (state) => {
        state.status = "rejected";
      });
  },
});

export const { createBoard, selectBoard, editBoard, deleteBoard, createTask, editTask, deleleTask, toggleTaskCompletion, initialize, saveToLocalStorage, setUser } =
  boardSlice.actions;

export const getBoards = (state: RootState) => state.boards;
export const getSelectedBoard = (state: RootState) => state.selectedBoard;
export const getUid = (state: RootState) => state.uid;

export default boardSlice.reducer;
