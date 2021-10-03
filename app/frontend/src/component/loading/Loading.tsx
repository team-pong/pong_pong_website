import { CSSProperties, FC } from "react";

/*!
 * @author yochoi
 * @brief 로딩시 사용할 svg
 */

interface loadingProps {
  style: CSSProperties;
  color: string;
}

const Loading: FC<loadingProps> = (props): JSX.Element => {

  return (
    <svg version="1.1" id="L4" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
      viewBox="0 0 100 100" enableBackground="new 0 0 0 0" xmlSpace="preserve" style={{...props.style}}>
      <circle fill={props.color} stroke="none" cx="30" cy="50" r="6">
        <animate
          attributeName="opacity"
          dur="1s"
          values="0;1;0"
          repeatCount="indefinite"
          begin="0.1"/>
      </circle>
      <circle fill={props.color} stroke="none" cx="50" cy="50" r="6">
        <animate
          attributeName="opacity"
          dur="1s"
          values="0;1;0"
          repeatCount="indefinite"
          begin="0.2"/>
      </circle>
      <circle fill={props.color} stroke="none" cx="70" cy="50" r="6">
        <animate
          attributeName="opacity"
          dur="1s"
          values="0;1;0"
          repeatCount="indefinite"
          begin="0.3"/>
      </circle>
    </svg>
  )
}

export default Loading;