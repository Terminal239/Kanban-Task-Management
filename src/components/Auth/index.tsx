import { useState } from "react";
import Login from "./Login";
import Button from "../Reusable/Button";
import SignUp from "./SignUp";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { authentication, db } from "../../../firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../hooks";
import { DUMMY_DATA, setUser } from "../../redux/slice";
import CircularProgress from "../Reusable/CircularProgress";

export const Auth = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isSignUp, setIsSignUp] = useState(false);
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const onChange = (field: "email" | "password" | "confirmPassword" | "displayName", value: string) => {
    setCredentials((prev) => {
      const changed = { ...prev };
      changed[field] = value;
      return changed;
    });
  };

  const handleSubmit = async () => {
    try {
      if (isSignUp) {
        setIsLoading(true);
        const { email, password } = credentials;
        await createUserWithEmailAndPassword(authentication, email, password);
        const board = doc(db, `${authentication.currentUser!.uid}/board`);
        const profile = doc(db, `${authentication.currentUser!.uid}/profile`);
        await setDoc(board, { board: DUMMY_DATA });
        await setDoc(profile, { displayName: credentials.displayName });
        setIsLoading(false);
      } else {
        setIsLoading(true);
        const { email, password } = credentials;
        await signInWithEmailAndPassword(authentication, email, password);
        setIsLoading(false);
      }
      dispatch(setUser(authentication.currentUser!.uid));
      navigate("/app");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex size-full items-center justify-center bg-magenta-800 p-4">
      <div className="flex w-full max-w-[500px] flex-col gap-4 rounded-lg bg-magenta-700 p-6 md:gap-6 md:p-8">
        {isSignUp ? <SignUp credentials={credentials} onChange={onChange} /> : <Login credentials={credentials} onChange={onChange} />}
        <Button disabled={isLoading} handleClick={handleSubmit} type="primary" additionalClasses="mt-8 flex justify-center items-center gap-4">
          {isSignUp ? "Sign Up" : "Login"}
          {isLoading && <CircularProgress />}
        </Button>
        <Button handleClick={() => setIsSignUp((prev) => !prev)} type="text" additionalClasses="text-white text-center text-magenta-900 dark:text-center">
          {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up!"}
        </Button>
      </div>
    </div>
  );
};
