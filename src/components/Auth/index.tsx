import { FirebaseError } from "firebase/app";
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authentication, db } from "../../../firebase/config";
import { icons } from "../../constants";
import { useAppDispatch } from "../../hooks";
import { DUMMY_DATA, setUser } from "../../redux/slice";
import Button from "../Reusable/Button";
import CircularProgress from "../Reusable/CircularProgress";
import Login from "./Login";
import SignUp from "./SignUp";

const TIMER = 30;

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
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isEmailResent, setIsEmailResent] = useState<boolean | null>(null);
  const [timer, setTimer] = useState(TIMER);

  useEffect(() => {
    let countdown: NodeJS.Timeout;
    if (isEmailResent)
      countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

    return () => {
      clearInterval(countdown);
    };
  }, [isEmailResent]);

  useEffect(() => {
    if (timer === 0) {
      setIsEmailResent(false);
      setTimer(TIMER);
    }
  }, [timer]);

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
        const userCredential = await createUserWithEmailAndPassword(authentication, email, password);

        // Send verification email
        await sendEmailVerification(userCredential.user);

        const board = doc(db, `${userCredential.user.uid}/board`);
        const profile = doc(db, `${userCredential.user.uid}/profile`);
        await setDoc(board, { boards: DUMMY_DATA });
        await setDoc(profile, { displayName: displayName });

        setIsVerified(false);
      } else {
        const error = validate("email", credentials.email) || validate("password", credentials.password);
        if (error) {
          setIsLoading(false);
          return;
        }

        const { email, password } = credentials;
        const userCredential = await signInWithEmailAndPassword(authentication, email, password);

        // Check if email is verified
        if (!userCredential.user.emailVerified) {
          setIsVerified(false);
          setIsLoading(false);
          return;
        }

        dispatch(setUser(authentication.currentUser!.uid));
        navigate("/app");
      }
      setIsLoading(false);
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        setError(`An error occurred: ${error.message}`);
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

  const handleBackToLogin = () => {
    setIsVerified(null);
    setIsSignUp(false);
  };

  const resendVerificationEmail = async () => {
    try {
      const user = authentication.currentUser;
      if (user && !user.emailVerified) await sendEmailVerification(user);

      setIsEmailResent(true);
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        setError(`An error occurred: ${error.message}`);
        setTimeout(() => {
          setError("");
        }, 5000);
      }
    }
  };

  const VertificationUI = () => (
    <div className="flex flex-col items-center gap-4 text-white">
      <svg xmlns="http://www.w3.org/2000/svg" className="size-12" viewBox="0 0 512 512">
        <path
          fill="#fff"
          d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48L48 64zM0 176L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-208L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"
        />
      </svg>
      <p className="text-center text-lg leading-6 text-white">
        {isSignUp ? "A verification email has been sent. Please check your inbox." : "You haven't verfied your email address. Please verify to continue."}
      </p>
      <div className="mt-4 flex flex-col gap-2">
        <Button handleClick={handleBackToLogin} type="primary" additionalClasses="text-white text-center text-magenta-900 dark:text-center">
          {isSignUp ? "Login" : "Back to login"}
        </Button>
        {!isEmailResent ? (
          <Button handleClick={resendVerificationEmail} type="text" additionalClasses="text-white text-center text-magenta-900 dark:text-center">
            Haven't received the mail? Click to resend
          </Button>
        ) : (
          <p className="text-center text-red-400">Verification email resent, please check your inbox. Wait for {timer} seconds before retrying!</p>
        )}
      </div>
    </div>
  );

  const CreationUI = () => (
    <>
      {isSignUp ? <SignUp errors={errors} credentials={credentials} onChange={onChange} /> : <Login error={error} credentials={credentials} onChange={onChange} />}
      {error && <span className="text-red-500">{error}</span>}
      <Button disabled={isLoading} handleClick={handleSubmit} type="primary" additionalClasses="mt-8 flex justify-center items-center gap-4">
        {isSignUp ? "Sign Up" : "Login"}
        {isLoading && <CircularProgress />}
      </Button>
      <Button handleClick={handleSignUp} type="text" additionalClasses="text-white text-center text-magenta-900 dark:text-center">
        {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up!"}
      </Button>
    </>
  );

  return (
    <div className="flex size-full flex-col items-center justify-center gap-6 bg-magenta-800 p-4">
      <img src={icons.logoLight} alt="logo of the application" className="h-8 object-contain lg:h-10" />
      <div className="flex w-full max-w-[500px] flex-col gap-4 rounded-lg bg-magenta-700 p-6 md:gap-6 md:p-8">{isVerified === null ? CreationUI() : VertificationUI()}</div>
    </div>
  );
};
