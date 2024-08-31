import { useWindowSize } from "@uidotdev/usehooks";
import { deleteUser, getAuth } from "firebase/auth";
import { doc, DocumentData, getDoc } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authentication, db } from "../../../firebase/config";
import { icons } from "../../constants";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { selectBoard, setUser } from "../../redux/slice";
import CreateNewBoardModal from "../Modals/BoardModal";
import ModalAnimate from "../Modals/ModalAnimate";
import TwoFactorModal from "../Modals/TwoFactorModal";
import CircularProgress from "../Reusable/CircularProgress";

interface Props {
  profile: DocumentData | undefined;
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  handleThemeSwitch: () => void;
}

const Sidebar = ({ profile, setShowSidebar, handleThemeSwitch }: Props) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { width } = useWindowSize();
  const { boards: state } = useAppSelector((state) => state.board);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);

  const [showQRModal, setShowQRModal] = useState(false);
  const [twoFactor, setTwoFactor] = useState<boolean>(false);

  useEffect(() => {
    checkTwoFactorAuthentication();
  }, []);

  const handleBoardSelect = (id: number) => {
    dispatch(selectBoard(id));
  };

  const handleOnClickDeleteAccount = () => {
    const auth = getAuth();
    const user = auth.currentUser;
    setIsDeleting(true);
    deleteUser(user!)
      .then(() => {
        navigate("/");
        setIsDeleting(false);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleLogout = () => {
    dispatch(setUser(""));
    navigate("/");
  };

  const handleTwoFactor = () => {
    setShowQRModal(true);
  };

  async function checkTwoFactorAuthentication() {
    const userId = authentication.currentUser?.uid;
    let isTwoFactorEnabled;
    if (userId) {
      try {
        const userDocRef = doc(db, `${userId}/profile`);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) isTwoFactorEnabled = userDoc.data()?.isTwoFactorEnabled;
      } catch (error) {
        console.error("Error checking 2FA status:", error);
      }
    }

    setTwoFactor(isTwoFactorEnabled);
  }

  return (
    <>
      <motion.aside
        initial={{ x: "-250%", y: width! < 768 ? "16px" : 0 }}
        animate={{ x: width! < 768 ? "-50%" : 0, y: width! < 768 ? "16px" : 0 }}
        exit={{ x: "-250%" }}
        transition={{ bounce: 0 }}
        className="absolute left-[50%] z-50 flex w-[85%] translate-x-[-50%] translate-y-4 flex-col rounded-lg border-r-lightGray bg-white px-6 py-4 shadow-lg dark:border-[#495057] dark:bg-magenta-700 md:static md:basis-[256px] md:translate-x-0 md:translate-y-0 md:rounded-none md:border-r md:shadow-none"
      >
        <p className="mb-4 text-[12px] font-bold uppercase tracking-[4px] text-text">All boards ({state.length})</p>
        <div className="flex max-h-[320px] flex-col gap-2 overflow-x-auto md:-ml-6 md:mb-8 md:max-h-full">
          {state.map(({ id, name }) => (
            <button
              onClick={() => handleBoardSelect(id)}
              role="button"
              key={id}
              className="group flex cursor-pointer items-center gap-4 rounded py-3 pl-6 transition-all hover:bg-gray-200 md:rounded-r-full"
            >
              <img src={icons.board} alt="icon of a board" />
              <span className="font-bold text-text group-hover:text-magenta-400">{name}</span>
            </button>
          ))}
          <button
            onClick={() => setShowModal((prev) => !prev)}
            className="flex cursor-pointer items-center gap-4 rounded py-3 pl-6 text-magenta-400 transition-all hover:bg-gray-200 md:rounded-r-full"
          >
            <img src={icons.board} alt="icon of a board" />
            <div className="flex items-center gap-1 font-bold">
              <span className="mb-0.5">+</span>
              <span>Create New Board</span>
            </div>
          </button>
        </div>
        <div className="mb-2 mt-8 flex items-center justify-center gap-4 rounded-lg bg-magenta-200 p-2 dark:bg-magenta-800 md:mt-auto md:gap-6 md:p-4">
          <img src={icons.dark} alt={"icon of the moon"} />
          <button onClick={handleThemeSwitch} className="flex h-6 w-12 justify-end rounded-full bg-magenta-400 p-1 dark:justify-start">
            <div className="size-4 rounded-full bg-white"></div>
          </button>
          <img src={icons.light} alt={"icon of the sun"} />
        </div>
        {width! >= 768 && (
          <button
            className={`group relative -ml-6 mb-6 flex cursor-pointer items-center gap-4 rounded-r-full py-3 pl-6 font-bold text-text transition-all hover:bg-gray-200`}
            onClick={() => setShowSidebar((prev) => !prev)}
          >
            <img src={icons.hideSidebar} className="mt-1" alt="icon of an crossed out eye" /> Hide Sidebar
          </button>
        )}

        <div className="relative -mx-6 -my-4 flex items-center gap-4 p-6 dark:border-[#495057] dark:text-magenta-200 md:border-t md:p-4">
          <div className="flex size-8 items-center justify-center rounded-full bg-magenta-400 text-lg font-bold text-magenta-200  dark:bg-magenta-200 dark:text-magenta-900">
            {profile?.displayName[0].toUpperCase()}
          </div>
          <p className="font-bold leading-none">{profile?.displayName}</p>
          <button onClick={() => setDialogVisible((prev) => !prev)} className="button-ellipsis ml-auto">
            <img src={icons.verticalEllipsis} alt="ellipsis" />
          </button>
          <AnimatePresence>
            {dialogVisible && (
              <motion.div
                initial={{ opacity: 0, y: width! < 768 ? "35%" : "-25%" }}
                animate={{ opacity: 1, y: width! < 768 ? "32px" : "-15%" }}
                exit={{ opacity: 0, y: width! < 768 ? "35%" : "-25%" }}
                transition={{ bounce: 0, duration: 0.1 }}
                className="absolute inset-x-4 top-16 flex flex-col overflow-hidden rounded-lg border-lightGray bg-white shadow-xl dark:border-[#495057] dark:bg-magenta-700 md:-top-32 md:border"
              >
                <button
                  onClick={handleTwoFactor}
                  className="flex items-center gap-4 p-4 text-left text-text transition hover:bg-lightGray hover:text-magenta-400 dark:hover:bg-white"
                >
                  <i className="fa-solid fa-mobile"></i> 2-Factor Auth
                </button>
                <button onClick={handleLogout} className="flex items-center gap-4 p-4 text-left text-text transition hover:bg-lightGray hover:text-magenta-400 dark:hover:bg-white">
                  <i className="fa-solid fa-right-from-bracket"></i> Log out
                </button>
                <button onClick={handleOnClickDeleteAccount} className="flex items-center gap-4 p-4 text-left text-red-400 transition hover:bg-red-400 hover:text-magenta-700">
                  <i className="fa-solid fa-trash"></i> Delete account
                  {isDeleting && <CircularProgress classes="ml-auto" />}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
      <ModalAnimate showModal={showModal} Component={<CreateNewBoardModal setShowModal={setShowModal} />} />
      <ModalAnimate showModal={showQRModal} Component={<TwoFactorModal setTwoFactor={setTwoFactor} twoFactor={twoFactor} setShowModal={setShowQRModal} />} />
    </>
  );
};

export default Sidebar;
