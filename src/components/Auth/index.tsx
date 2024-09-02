import { Buffer } from "buffer";
import { FirebaseError } from "firebase/app";
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import OTP from "otp";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authentication, db } from "../../../firebase/config";
import { icons } from "../../constants";
import { useAppDispatch } from "../../hooks";
import { DUMMY_DATA, setUser } from "../../redux/slice";
import Button from "../Reusable/Button";
import CircularProgress from "../Reusable/CircularProgress";
import Login from "./Login";
import SignUp from "./SignUp";

window.Buffer = Buffer;

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
  const [twoFactorCode, setTwoFactorCode] = useState<string[]>(["", "", "", "", "", ""]);

  const [hasTwoFactor, setHasTwoFactor] = useState<boolean | null>(null);
  const [twoFactorError, setTwoFactorError] = useState(false);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

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

        const userId = userCredential.user.uid;
        const board = doc(db, `${userId}/board`);
        const profile = doc(db, `${userId}/profile`);
        await setDoc(board, { boards: DUMMY_DATA });
        await setDoc(profile, { displayName: displayName });
        await setDoc(doc(db, "users", userId), { totpSecret: null, isTwoFactorEnabled: false }, { merge: true });

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

        await checkTwoFactorAuthentication();
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
    setHasTwoFactor(null);
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

  async function checkTwoFactorAuthentication() {
    const userId = authentication.currentUser?.uid;
    if (userId) {
      try {
        // Retrieve the user's profile document to check if 2FA is enabled
        const profileRef = doc(db, "users", userId);
        const profileDoc = await getDoc(profileRef);

        if (profileDoc.exists()) {
          const { isTwoFactorEnabled } = profileDoc.data();

          if (isTwoFactorEnabled) {
            setHasTwoFactor(true); // Update the state to indicate 2FA is enabled
          } else {
            // 2FA is not enabled, proceed to set the user and navigate to the app
            dispatch(setUser(authentication.currentUser!.uid));
            navigate("/app");
          }
        } else {
          console.log("User profile document does not exist.");
        }
      } catch (error) {
        console.error("Error checking 2FA status:", error);
      }
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    setTwoFactorError(false);
    const value = event.target.value;

    if (value.length > 1 || (value.length !== 0 && isNaN(parseInt(value)))) {
      return; // Do nothing if the input is not a single digit or is not a number
    }

    const updated = [...twoFactorCode];
    updated[index] = value || "";
    setTwoFactorCode(updated);

    // Automatically move to the next input field if the user types a number
    if (value.length === 1 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Automatically move to the previous input field if the user deletes a number
    if (value.length === 0 && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === "Backspace" && !twoFactorCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  async function verifyTotpCode(inputCode: string) {
    const userId = authentication.currentUser?.uid;

    if (!userId) {
      setTwoFactorError(true);
      return;
    }

    const profileRef = doc(db, "users", userId);
    const profileDoc = await getDoc(profileRef);

    if (profileDoc.exists()) {
      const { totpSecret } = profileDoc.data();

      if (totpSecret) {
        // Create an OTP instance with the stored secret
        const otp = new OTP({ secret: totpSecret });

        // Verify the TOTP code
        const isValid = otp.totp(Date.now()) === inputCode;

        if (isValid) {
          dispatch(setUser(authentication.currentUser!.uid));
          navigate("/app");
        } else {
          setTwoFactorError(true);
        }
      } else {
        setTwoFactorError(true);
      }
    } else {
      setTwoFactorError(true);
    }

    setTimeout(() => {
      setTwoFactorError(false);
    }, 5000);
  }

  useEffect(() => {
    if (twoFactorCode.every((code) => code.length !== 0)) verifyTotpCode(twoFactorCode.join(""));
  }, [twoFactorCode]);

  const TwoFactorUI = () => (
    <div className="flex flex-col items-center gap-4 text-white">
      <p className="text-center leading-6 text-white md:text-lg">Please enter the 6-digit code generated by your authentication app.</p>
      <div className="flex justify-center gap-4">
        {twoFactorCode.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            className={`h-16 w-8 rounded bg-magenta-800 p-2 text-center text-2xl text-white shadow-inner md:h-20 md:w-12 ${twoFactorError ? "border-2 border-red-400" : ""}`}
            onChange={(event) => handleInputChange(event, index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            type="text"
            maxLength={1}
            value={digit}
          />
        ))}
      </div>
      {twoFactorError && <p className="text-center text-red-400">Invalid Code. Please try again!</p>}

      <div className="mt-4 flex flex-col gap-2">
        <Button handleClick={handleBackToLogin} type="primary" className="text-center text-white dark:text-center">
          {isSignUp ? "Login" : "Back to login"}
        </Button>
      </div>
    </div>
  );

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
        <Button handleClick={handleBackToLogin} type="primary" className="text-center text-white dark:text-center">
          {isSignUp ? "Login" : "Back to login"}
        </Button>
        {!isEmailResent ? (
          <Button handleClick={resendVerificationEmail} type="text" className="text-center text-sm text-white dark:text-center md:text-base">
            Haven't received the mail? Click to resend
          </Button>
        ) : (
          <p className="text-center text-sm text-red-400 md:text-base">Verification email resent, please check your inbox. Wait for {timer} seconds before retrying!</p>
        )}
      </div>
    </div>
  );

  const CreationUI = () => (
    <>
      {isSignUp ? <SignUp errors={errors} credentials={credentials} onChange={onChange} /> : <Login error={error} credentials={credentials} onChange={onChange} />}
      {error && <span className="text-red-500">{error}</span>}
      <Button disabled={isLoading} handleClick={handleSubmit} type="primary" className="mt-8 flex items-center justify-center gap-4">
        {isSignUp ? "Sign Up" : "Login"}
        {isLoading && <CircularProgress />}
      </Button>
      <Button handleClick={handleSignUp} type="text" className="text-center text-white dark:text-center">
        {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up!"}
      </Button>
    </>
  );

  return (
    <div className="flex size-full flex-col items-center justify-center gap-6 bg-magenta-800 p-4">
      <img src={icons.logoLight} alt="logo of the application" className="h-8 object-contain lg:h-10" />
      <div className="flex w-full max-w-[500px] flex-col gap-4 rounded-lg bg-magenta-700 p-6 md:gap-6 md:p-8">
        {hasTwoFactor && TwoFactorUI()}
        {hasTwoFactor === null && (isVerified === null ? CreationUI() : VertificationUI())}
      </div>
    </div>
  );
};
