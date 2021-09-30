import { FC } from "react";
import "/src/scss/noresult/NoResult.scss";

interface NoResultProps {
  text?: string;
  width: string;
  height: string;
}

const NoResult: FC<NoResultProps> = (props) => {
  return (
    <div className="no-result" style={{width: props.width, height: props.height}}>
      <img src="/public/exclamation-mark.svg" className="no-result-img" alt="Exclamation mark" />
      <span className="no-result-span">{props.text ? props.text : "검색 결과가 없습니다"}</span>
    </div>
  );
}

export default NoResult;