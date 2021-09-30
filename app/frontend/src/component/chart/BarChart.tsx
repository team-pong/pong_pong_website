import { FC } from "react";

interface barChartProps {
  left: number,
  right: number
}

const BarChart: FC<barChartProps> = ({left, right}):JSX.Element => {
  return (
    <svg className="bar-chart-svg" viewBox="0 0 100 10" xmlns="http://www.w3.org/2000/svg">
      <g fill="gray">
        <rect x="0" y="0" width={100} height="10" />
      </g>
      <g fill="#62C375">
        <rect x="0" y="0" width={left} height="10" />
      </g>
      <g fill="#CE4D36">
        <rect x={left} y="0" width={right} height="10" />
      </g>
    </svg>
  );
}

export default BarChart;