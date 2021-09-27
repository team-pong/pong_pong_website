import { FC, useState, useEffect, Dispatch, SetStateAction } from "react";
import "../../../scss/dm/DmList.scss";
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

interface DmListProps {
  setDmTarget: Dispatch<SetStateAction<string>>;
}

const DmList: FC<DmListProps> = ({setDmTarget}): JSX.Element => {

  const [dmList, setDmList] = useState<DM[]>(null);

  /*!
  * @author yochoi
  * @brief DM 리스트를 가져오는 useEffect
  * @todo DM api 가 완성되면 easyFetch를 사용해서 수정해야함
  */
  useEffect(() => {
    setDmList(testDMList);
  }, []);

  return (
    <ul className="dm-list">
      {
        dmList?.map((dm, idx) => {
          return (
            <li
              key={idx}
              className="dm-list-li"
              onClick={() => setDmTarget(dm.target.nick)}>
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
  );
};

export default DmList;