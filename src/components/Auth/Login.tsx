import { FC } from "react";

interface Props {
  credentials: {
    email: string;
    password: string;
    confirmPassword: string;
  };
  error: string;
  onChange: (field: "email" | "password" | "confirmPassword", value: string) => void;
}

const Login: FC<Props> = ({ error, credentials, onChange }) => {
  return (
    <>
      <h1 className="text-2xl font-bold text-white dark:text-magenta-200 lg:text-3xl">Login</h1>
      <form className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-lg text-white" htmlFor="email">
            Email
          </label>
          <input
            value={credentials.email}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange("email", event.target.value)}
            className={`auth-input ${error ? "border border-red-400" : ""}`}
            type="email"
            id="email"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-lg text-white" htmlFor="password">
            Password
          </label>
          <input
            value={credentials.password}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange("password", event.target.value)}
            className={`auth-input ${error ? "border border-red-400" : ""}`}
            type="password"
            id="password"
          />
        </div>
      </form>
    </>
  );
};

export default Login;
