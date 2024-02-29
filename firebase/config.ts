import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyADsPY9i9z-uWOu3nAH00T1Ivd4ND1b394",
  authDomain: "kanban-task-management-81cc8.firebaseapp.com",
  projectId: "kanban-task-management-81cc8",
  storageBucket: "kanban-task-management-81cc8.appspot.com",
  messagingSenderId: "978987170161",
  appId: "1:978987170161:web:fdfffc87733bf499259ed0",
};

const app = initializeApp(firebaseConfig);
export const authentication = getAuth(app);
export const db = getFirestore(app);
