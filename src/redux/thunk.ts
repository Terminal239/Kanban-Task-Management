import { createAsyncThunk } from "@reduxjs/toolkit";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { useAppSelector } from "../hooks";
import { doc } from "firebase/firestore";
import { db } from "../../firebase/config";

export const getBoardData = createAsyncThunk("board/fetch", () => {
  try {
    const uid = useAppSelector((state) => state.board.uid);
    const boardRef = doc(db, `${uid}/board`);
    const [data] = useDocumentData(boardRef);
    return data;
  } catch (error) {
    return error;
  }
});
