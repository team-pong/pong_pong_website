import { FC, useEffect, useRef, useState } from "react";
import "/src/scss/dm/Dm.scss";
import { testDMList, DM } from "../../../dummydata/testDM";


/*!
  * @author yochoi
  * @brief  msg가 20글자를 넘어가면 16글자까지만 출력하고
  *         나머지는 ... 으로 대체하는 함수
  */
function msgFormatter(msg: string): string {
  if (msg === null || msg === undefined) return (null);
  if (msg.length >= 20) {
    return (msg.slice(0, 17) + "...");
  }
  return (msg);
}

const Dm: FC<{isDmOpen: boolean}> = ({isDmOpen}): JSX.Element => {

  const dmRef = useRef<HTMLDivElement>(null);
  const [dmList, setDmList] = useState<DM[]>(null);

  useEffect(() => {
    if (isDmOpen) {
      dmRef.current.className = "dm-list in";
    } else {
      dmRef.current.className = "dm-list out";
    }
  }, [isDmOpen]);

  /*!
  * @author yochoi
  * @brief 페이지가 로드될 떄 애니메이션 재생을 막기 위한 useEffect
  *        이 함수가 없으면 페이지가 로드될 때 isDmOpen이 false 이므로 dm out
  *        애니메이션이 실행됨
  */
  useEffect(() => {
    dmRef.current.className = "dm-list";
  }, []);

  /*!
  * @author yochoi
  * @brief DM 리스트를 가져오는 useEffect
  * @todo DM api 가 완성되면 easyFetch를 사용해서 수정해야함
  */
  useEffect(() => {
    setDmList(testDMList);
  }, []);

  return (
    <div className="dm-list" ref={dmRef}>
      <div className="top-bar">
        <span>개인 메세지</span>
      </div>
      <ul className="dm-list-ul">
      {
        dmList?.map((dm, idx) => {
          return (
            <li key={idx} className="dm-list-li">
              <img
                className="dm-list-li-avatar"
                src={dm.target.avatar_url}
                alt="dm target avatar"/>
              <span className="dm-list-li-nick">{dm.target.nick}</span>
              <span className="dm-list-li-last-msg">{msgFormatter(dm.lastMsg)}</span>
              <span className="dm-list-li-last-msg-time">{dm.lastMsgTime}</span>
            </li>
          );
        })
      }
      </ul>
    </div>
  )
}

export default Dm;