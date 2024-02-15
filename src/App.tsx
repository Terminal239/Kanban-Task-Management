import { useEffect, useState } from "react";
import { useWindowSize } from "@uidotdev/usehooks";
import { useAppDispatch, useAppSelector } from "./hooks";

import TopBar from "./components/TopBar/TopBar";
import AppWrapper from "./components/Utils/AppWrapper";
import Board from "./components/Board/Board";
import Sidebar from "./components/Sidebar/Sidebar";
import NoBoardFound from "./components/Utils/NoBoardFound";
import { icons } from "./constants";
import "./app.css";
import { getFromLocalStorage } from "./redux/slices/boardSlice";

function App() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((state) => state.board.boards);

  const { width } = useWindowSize();
  const [showSidebar, setShowSidebar] = useState(true);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    let theme = "";
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
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
    dispatch(getFromLocalStorage());
  }, []);

  const handleThemeSwitch = () => {
    setTheme((prev) => {
      const theme = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme", theme);
      return theme;
    });
  };

  if (state.length === 0) {
    return <NoBoardFound />;
  }

  return (
    <>
      <TopBar theme={theme} showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
      <AppWrapper>
        {width! < 768 && showSidebar && <div onClick={() => setShowSidebar(false)} className="absolute size-full bg-black/20"></div>}
        {showSidebar && <Sidebar setShowSidebar={setShowSidebar} handleThemeSwitch={handleThemeSwitch} />}
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
