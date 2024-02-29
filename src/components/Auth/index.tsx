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
import { FirebaseError } from "firebase/app";

export const Auth = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
  });

  function extractErrorMessage(errorMsg) {
    const startIndex = errorMsg.indexOf("(");
    const endIndex = errorMsg.indexOf(")");
    if (startIndex !== -1 && endIndex !== -1) {
      return errorMsg.substring(startIndex + 1, endIndex);
    } else {
      return "No error message found between parentheses";
    }
  }

  const validateDisplayName = (displayName: string) => {
    if (!displayName) {
      return "Display name is required";
    }
    return "";
  };

  const validateEmail = (email: string) => {
    if (!email) {
      return "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      return "Email is invalid";
    }
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return "Password is required";
    } else if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    return "";
  };

  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) {
      return "Confirm password is required";
    } else if (confirmPassword !== credentials.password) {
      return "Passwords do not match";
    }
    return "";
  };

  const validate = (field: keyof typeof credentials, value: string) => {
    let error = "";
    switch (field) {
      case "displayName":
        error = validateDisplayName(value);
        break;
      case "email":
        error = validateEmail(value);
        break;
      case "password":
        error = validatePassword(value);
        break;
      case "confirmPassword":
        error = validateConfirmPassword(value);
        break;
      default:
        break;
    }
    setErrors((prevErrors) => ({ ...prevErrors, [field]: error }));
    return error.length > 0;
  };

  const onChange = (field: "email" | "password" | "confirmPassword" | "displayName", value: string) => {
    setCredentials((prev) => {
      const changed = { ...prev };
      changed[field] = value;
      return changed;
    });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (isSignUp) {
        const error =
          validate("displayName", credentials.displayName) ||
          validate("email", credentials.email) ||
          validate("password", credentials.password) ||
          validate("confirmPassword", credentials.confirmPassword);
        if (error) {
          setIsLoading(false);
          return;
        }

        const { email, displayName, password } = credentials;
        await createUserWithEmailAndPassword(authentication, email, password);
        const board = doc(db, `${authentication.currentUser!.uid}/board`);
        const profile = doc(db, `${authentication.currentUser!.uid}/profile`);
        await setDoc(board, { board: DUMMY_DATA });
        await setDoc(profile, { displayName: displayName });
      } else {
        const error = validate("email", credentials.email) || validate("password", credentials.password);
        if (error) {
          setIsLoading(false);
          return;
        }

        const { email, password } = credentials;
        await signInWithEmailAndPassword(authentication, email, password);
      }
      dispatch(setUser(authentication.currentUser!.uid));
      navigate("/app");
      setIsLoading(false);
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        setError(`An error occured: ${error.message}`);
        setTimeout(() => {
          setError("");
        }, 5000);
      }
    }
    setIsLoading(false);
  };

  const handleSignUp = () => {
    setCredentials({
      email: "",
      password: "",
      confirmPassword: "",
      displayName: "",
    });
    setErrors({
      email: "",
      password: "",
      confirmPassword: "",
      displayName: "",
    });
    setError("");
    setIsSignUp((prev) => !prev);
  };

  return (
    <div className="flex size-full items-center justify-center bg-magenta-800 p-4">
      <div className="flex w-full max-w-[500px] flex-col gap-4 rounded-lg bg-magenta-700 p-6 md:gap-6 md:p-8">
        {isSignUp ? <SignUp errors={errors} credentials={credentials} onChange={onChange} /> : <Login error={error} credentials={credentials} onChange={onChange} />}
        {error && <span className="text-red-500">{error}</span>}
        <Button disabled={isLoading} handleClick={handleSubmit} type="primary" additionalClasses="mt-8 flex justify-center items-center gap-4">
          {isSignUp ? "Sign Up" : "Login"}
          {isLoading && <CircularProgress />}
        </Button>
        <Button handleClick={handleSignUp} type="text" additionalClasses="text-white text-center text-magenta-900 dark:text-center">
          {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up!"}
        </Button>
      </div>
    </div>
  );
};
