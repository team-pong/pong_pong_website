import { FC, useEffect, useRef, useState } from "react";
import DmList from "./DmList";
import DmRoom from "./DmRoom";
import "/src/scss/dm/Dm.scss";

const Dm: FC<{isDmOpen: boolean}> = ({isDmOpen}): JSX.Element => {

  const dmRef = useRef<HTMLDivElement>(null);
  const [dmTarget, setDmTarget] = useState("");

  useEffect(() => {
    if (isDmOpen) {
      dmRef.current.className = "dm-container in";
    } else {
      dmRef.current.className = "dm-container out";
      setDmTarget("");
    }
  }, [isDmOpen]);

  /*!
  * @author yochoi
  * @brief 페이지가 로드될 떄 애니메이션 재생을 막기 위한 useEffect
  *        이 함수가 없으면 페이지가 로드될 때 isDmOpen이 false 이므로 dm out
  *        애니메이션이 실행됨
  */
  useEffect(() => {
    dmRef.current.className = "dm-container";
  }, []);

  return (
    <div className="dm-container" ref={dmRef}>
      <div className="top-bar">
        <span>개인 메세지</span>
      </div>
      {dmTarget === "" ? <DmList setDmTarget={setDmTarget}/> : <DmRoom dmTarget={dmTarget}/>}
    </div>
  )
}

export default Dm;