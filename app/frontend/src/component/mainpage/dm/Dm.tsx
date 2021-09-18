import { FC, useEffect, useRef } from "react";
import "/src/scss/dm/Dm.scss";

const Dm: FC<{isDmOpen: boolean}> = ({isDmOpen}): JSX.Element => {

  const dmRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDmOpen) {
      dmRef.current.className = "dm in";
    } else {
      dmRef.current.className = "dm out";
    }
  }, [isDmOpen]);

  /*!
  * @author yochoi
  * @brief 페이지가 로드될 떄 애니메이션 재생을 막기 위한 useEffect
  *        이 함수가 없으면 페이지가 로드될 때 isDmOpen이 false 이므로 dm out
  *        애니메이션이 실행됨
  */
  useEffect(() => {
    dmRef.current.className = "dm";
  }, []);

  return (
    <div className="dm" ref={dmRef}>
    </div>
  )
}

export default Dm;