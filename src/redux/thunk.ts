import { createAsyncThunk } from "@reduxjs/toolkit";
import { doc } from "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { db } from "../../firebase/config";
import { useAppSelector } from "../hooks";

export const getBoardData = createAsyncThunk("board/fetch", () => {
  try {
    const uid = useAppSelector((state) => state.uid);
    const boardRef = doc(db, `${uid}/board`);
    const [data] = useDocumentData(boardRef);
    return data;
  } catch (error) {
    return error;
  }
});
