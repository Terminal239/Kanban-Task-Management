import { useWindowSize } from "@uidotdev/usehooks";
import { doc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import { useAppDispatch, useAppSelector } from "./hooks";
import { getBoards, getUid, initialize } from "./redux/slice";

import { AnimatePresence } from "framer-motion";
import "./app.css";
import Board from "./components/Board/Board";
import CircularProgress from "./components/Reusable/CircularProgress";
import Sidebar from "./components/Sidebar/Sidebar";
import TopBar from "./components/TopBar/TopBar";
import AppWrapper from "./components/Utils/AppWrapper";
import NoBoardFound from "./components/Utils/NoBoardFound";
import { icons } from "./constants";

function App() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const boards = useAppSelector(getBoards);
  const uid = useAppSelector(getUid);

  const boardRef = doc(db, `${uid}/board`);
  const [data, loading] = useDocumentData(boardRef);

  const profileRef = doc(db, `${uid}/profile`);
  const [profile] = useDocumentData(profileRef);

  const { width } = useWindowSize();
  const [showSidebar, setShowSidebar] = useState(true);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    let theme = "";
    if (localStorage.getItem("theme")) {
      theme = localStorage.getItem("theme")!;
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      theme = "dark";
    } else {
      theme = "light";
    }

    localStorage.setItem("theme", theme);
    setTheme(theme);
  }, []);

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }, [theme]);

  useEffect(() => {
    if (width && width < 768) {
      setShowSidebar(false);
    } else if (width && width >= 768) {
      setShowSidebar(true);
    }
  }, [width]);

  useEffect(() => {
    if (loading) return;
    if (uid === null) navigate("/");
    if (data) {
      dispatch(initialize(data.boards));
    }
  }, [loading]);

  useEffect(() => {
    if (!loading && boards && uid) saveBoard();
  }, [boards]);

  if (loading) {
    return (
      <div className="flex size-full flex-col items-center justify-center gap-4 bg-magenta-700">
        <CircularProgress classes="size-12 md:size-16 border-4" />
        <p className="text-lg font-bold text-white md:text-3xl">Loading...</p>
      </div>
    );
  }

  const saveBoard = async () => {
    try {
      const boardDoc = doc(db, `${uid}/board`);
      await updateDoc(boardDoc, { boards });
    } catch (error) {
      console.log(error);
    }
  };

  const handleThemeSwitch = () => {
    setTheme((prev) => {
      const theme = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme", theme);
      return theme;
    });
  };

  if (boards.length === 0) return <NoBoardFound />;

  return (
    <>
      <TopBar theme={theme} showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
      <AppWrapper>
        {width! < 768 && showSidebar && <div onClick={() => setShowSidebar(false)} className="absolute z-40 size-full bg-black/20"></div>}
        <AnimatePresence>{showSidebar && <Sidebar profile={profile} setShowSidebar={setShowSidebar} handleThemeSwitch={handleThemeSwitch} />}</AnimatePresence>
        {!showSidebar && width! >= 768 && (
          <button onClick={() => setShowSidebar(true)} className="absolute bottom-10 rounded-r-full bg-magenta-400 p-4">
            <img src={icons.showSidebar} className="w-6" alt="icon of an open eye" />
          </button>
        )}
        <Board />
      </AppWrapper>
    </>
  );
}

export default App;
