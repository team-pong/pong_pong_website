import { FC, useState, useEffect, Dispatch, SetStateAction, useContext } from "react";
import "../../../scss/dm/DmList.scss";
import { SetDmInfoContext } from "../../../Context";
import EasyFetch from "../../../utils/EasyFetch";
import Time from "../../../utils/Time";

interface DM {
  target: {
    avatar_url: string,
    nick: string
  },
  lastMsg: string,      /* e.g.) "안녕"                    */
  lastMsgTime: string   /* e.g.) "15분전"                 */
}

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

const DmList: FC = (): JSX.Element => {

  const [dmList, setDmList] = useState<DM[]>([]);
  const setDmInfo = useContext(SetDmInfoContext);

  const getDmList = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/dm-store/list`);
    const res: DM[] = await easyfetch.fetch();

    console.log("dmList: ", res);
    res.sort((a, b) => {
      if (a.lastMsgTime > b.lastMsgTime) return (-1);
      if (a.lastMsgTime === b.lastMsgTime) return (0);
      if (a.lastMsgTime < b.lastMsgTime) return (1);
    })
    const parsedRes: DM[] = res.map((val) => {
      val.lastMsgTime = new Time(val.lastMsgTime).getRelativeTime();
      return (val);
    });
    setDmList(parsedRes);
  }

  /*!
  * @author yochoi
  * @brief DM 리스트를 가져오는 useEffect
  */
  useEffect(() => {
    getDmList();
    global.socket.on("dm", () => getDmList());
    return (() => global.socket.off("dm", () => getDmList()))
  }, []);

  return (
    <ul className="dm-list">
      {
        dmList.map((dm, idx) => {
          return (
            <li
              key={idx}
              className="dm-list-li"
              onClick={() => setDmInfo({isDmOpen: true, target: dm.target.nick})}>
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