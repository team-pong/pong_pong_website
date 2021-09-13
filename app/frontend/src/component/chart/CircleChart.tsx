import { FC, useEffect } from "react";

/*!
 * @author yochoi
 * @brief 원형 차트
 */

interface circleChartProps {
  width: number;
  height: number;
  percentage: number;
}

const CircleChart: FC<circleChartProps> = (props): JSX.Element => {

  return (
    <div id="circle-chart" style={{width: props.width, height: props.height}}>
      <svg className="circle-chart-svg" viewBox="0 0 36 36">
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
          key={props.percentage}
          fill="none"
          strokeWidth="2.8"
          strokeLinecap="round"
          stroke="#4CC790"
          strokeDasharray={`${props.percentage}, 100`}
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <text className="circle-chart-text" x="18" y="20.35" style={{opacity: "0.5"}}>{`${props.percentage}%`}</text>
      </svg>
    </div>
  )
}

export default CircleChart;