import { FC, useContext } from "react";
import DmList from "./DmList";
import DmRoom from "./DmRoom";
import { DmInfoContext, SetDmInfoContext } from "../../../Context";
import "/src/scss/dm/Dm.scss";

const Dm: FC = (): JSX.Element => {

  const dmInfo = useContext(DmInfoContext);
  const setDmInfo = useContext(SetDmInfoContext);

  return (
    <div id="dm-outside" onClick={(e) => {if(e.target === e.currentTarget) setDmInfo({isDmOpen: false, target: ""})}}>
      <div className="dm-container">
        <div className="top-bar">
          <span>
            {
              dmInfo.target === ""
              ? <>개인 메세지</>
              : <><img
                    src="/public/arrow.svg"
                    alt="뒤로가기"
                    onClick={() => setDmInfo({isDmOpen: true, target: ""})} />{dmInfo.target}</>
            }
          </span>
        </div>
        {dmInfo.target === "" ? <DmList /> : <DmRoom dmInfo={dmInfo}/>}
      </div>
    </div>
  )
}

export default Dm;