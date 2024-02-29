import { FC } from "react";

interface Props {
  classes?: string;
}

const CircularProgress: FC<Props> = ({ classes }) => {
  return <div className={`circular-progress ${classes}`}></div>;
};

export default CircularProgress;
