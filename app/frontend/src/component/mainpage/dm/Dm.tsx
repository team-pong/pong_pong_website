import { Dispatch, FC, SetStateAction, useEffect, useRef, useState } from "react";
import DmList from "./DmList";
import DmRoom from "./DmRoom";
import "/src/scss/dm/Dm.scss";

const Dm: FC<{setIsDmOpen: Dispatch<SetStateAction<boolean>>}> = ({setIsDmOpen}): JSX.Element => {

  const dmRef = useRef<HTMLDivElement>(null);
  const [dmTarget, setDmTarget] = useState("");

  return (
    <div id="dm-outside" onClick={(e) => {if(e.target === e.currentTarget) setIsDmOpen(false)}}>
      <div className="dm-container" ref={dmRef}>
        <div className="top-bar">
          <span>
            {
              dmTarget === ""
              ? <>개인 메세지</>
              : <><img
                    src="/public/arrow.svg"
                    alt="뒤로가기"
                    onClick={() => setDmTarget("")} />{dmTarget}</>
            }
          </span>
        </div>
        {dmTarget === "" ? <DmList setDmTarget={setDmTarget}/> : <DmRoom dmTarget={dmTarget}/>}
      </div>
    </div>
  )
}

export default Dm;