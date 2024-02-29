import { FC } from "react";

interface Props {
  credentials: {
    email: string;
    password: string;
    confirmPassword: string;
    displayName: string;
  };
  errors: {
    email: string;
    password: string;
    confirmPassword: string;
    displayName: string;
  };
  onChange: (field: "email" | "password" | "confirmPassword" | "displayName", value: string) => void;
}

const SignUp: FC<Props> = ({ errors, credentials, onChange }) => {
  return (
    <>
      <h1 className="text-2xl font-bold text-white dark:text-magenta-200 lg:text-3xl">Login</h1>
      <form className="flex flex-col gap-4">
        <div className="relative flex flex-col gap-2">
          <label className="text-lg text-white" htmlFor="displayName">
            Display Name
          </label>
          <input
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange("displayName", event.target.value)}
            value={credentials.displayName}
            className={`auth-input ${errors.displayName ? "border border-red-400" : ""}`}
            type="text"
            id="displayName"
          />
          {errors.displayName && <span className="absolute right-0 top-1 text-red-500">{errors.displayName}</span>}
        </div>
        <div className="relative flex flex-col gap-2">
          <label className="text-lg text-white" htmlFor="email">
            Email
          </label>
          <input
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange("email", event.target.value)}
            value={credentials.email}
            className={`auth-input ${errors.email ? "border border-red-400" : ""}`}
            type="email"
            id="email"
          />
          {errors.email && <span className="absolute right-0 top-1 text-red-500">{errors.email}</span>}
        </div>
        <div className="relative flex flex-col gap-2">
          <label className="text-lg text-white" htmlFor="password">
            Password
          </label>
          <input
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange("password", event.target.value)}
            value={credentials.password}
            className={`auth-input ${errors.password ? "border border-red-400" : ""}`}
            type="password"
            id="password"
          />
          {errors.password && <span className="absolute right-0 top-1 text-red-500">{errors.password}</span>}
        </div>
        <div className="relative flex flex-col gap-2">
          <label className="text-lg text-white" htmlFor="confirm-password">
            Confirm Password
          </label>
          <input
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange("confirmPassword", event.target.value)}
            value={credentials.confirmPassword}
            className={`auth-input ${errors.confirmPassword ? "border border-red-400" : ""}`}
            type="password"
            id="confirm-password"
          />
          {errors.confirmPassword && <span className="absolute right-0 top-1 text-red-500">{errors.confirmPassword}</span>}
        </div>
      </form>
    </>
  );
};

export default SignUp;
