/// <reference types="vite/client" />

interface SubTask {
  id: number;
  name: string;
  completed: boolean;
}

interface Task {
  id: number;
  status: number;
  name: string;
  description: string;
  subTasks: SubTask[];
}

interface Column {
  id: number;
  color: string;
  name: string;
  tasks: Task[];
}

interface Board {
  id: number;
  name: string;
  columns: Column[];
}
