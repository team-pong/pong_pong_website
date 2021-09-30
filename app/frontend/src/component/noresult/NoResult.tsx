import { CSSProperties, FC } from "react";
import "/src/scss/noresult/NoResult.scss";

interface NoResultProps {
  text?: string;
  style?: CSSProperties;
}

const NoResult: FC<NoResultProps> = (props) => {
  return (
    <div className="no-result" style={{...props.style}}>
      <img src="/public/exclamation-mark.svg" className="no-result-img" alt="Exclamation mark" />
      <span className="no-result-span">{props.text ? props.text : "검색 결과가 없습니다"}</span>
    </div>
  );
}

export default NoResult;