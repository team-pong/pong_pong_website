import { FC, useEffect } from "react";

/*!
 * @author yochoi
 * @brief 로딩 동그라미
 */

interface loadingProps {
  width: number;
  height: number;
}

const Loading: FC<loadingProps> = (props): JSX.Element => {

  return (
    <div id="circle-chart" style={{width: props.width, height: props.height, position: "fixed"}}>
      <svg viewBox="0 0 36 36">
        <path
          fill="none"
          stroke="#eee"
          strokeWidth="3.8"
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <path
          id="percentage"
          fill="none"
          strokeWidth="2.8"
          strokeLinecap="round"
          stroke="#4CC790"
          strokeDasharray={"100, 100"}
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      </svg>
    </div>
  )
}

export default Loading;