import { FC } from "react";

interface Props {
  credentials: {
    email: string;
    password: string;
    confirmPassword: string;
    displayName: string;
  };
  onChange: (field: "email" | "password" | "confirmPassword" | "displayName", value: string) => void;
}

const SignUp: FC<Props> = ({ credentials, onChange }) => {
  return (
    <>
      <h1 className="text-2xl font-bold text-white dark:text-magenta-200 lg:text-3xl">Login</h1>
      <form className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-lg text-white" htmlFor="displayName">
            Display Name
          </label>
          <input
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange("displayName", event.target.value)}
            value={credentials.displayName}
            className="auth-input"
            type="displayName"
            id="displayName"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-lg text-white" htmlFor="email">
            Email
          </label>
          <input
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange("email", event.target.value)}
            value={credentials.email}
            className="auth-input"
            type="email"
            id="email"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-lg text-white" htmlFor="password">
            Password
          </label>
          <input
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange("password", event.target.value)}
            value={credentials.password}
            className="auth-input"
            type="password"
            id="password"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-lg text-white" htmlFor="confirm-password">
            Confirm Password
          </label>
          <input
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange("confirmPassword", event.target.value)}
            value={credentials.confirmPassword}
            className="auth-input"
            type="password"
            id="confirm-password"
          />
        </div>
      </form>
    </>
  );
};

export default SignUp;
