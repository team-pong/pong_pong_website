import { FC, useEffect, useState, Dispatch, SetStateAction } from "react";
import "../../../scss/dm/DmRoom.scss";
import { testDMLog, DMLog } from "../../../dummydata/testDM";

interface DmRoomProps {
  dmTarget: string;
}

const DmRoom: FC<DmRoomProps> = ({dmTarget}): JSX.Element => {

  const [dmLog, setDmLog] = useState<DMLog[]>(null);
  const [textAreaMsg, setTextAreaMsg] = useState("");

  useEffect(() => {
    setDmLog(testDMLog);
  }, []);

  return (
    <div className="dm-room">
      <ul className="dm-room-ul">
        {dmLog?.map((msg, idx) => {
          return (
            <li key={idx} className={`chat-log ${msg.from === "me" ? "me" : "other"}`}>
              <span className="chat-log-time">{msg.time}</span>
              <span className="chat-log-msg">{msg.msg}</span>
            </li>
          );
        })}
      </ul>
      <form className="dm-form">
        <textarea
          className="dm-msg-textarea"
          placeholder="대화내용 입력"
          rows={4}
          cols={50}
          value={textAreaMsg}
          onChange={({target: {value}}) => setTextAreaMsg(value)}/>
        <button className="dm-msg-button">전송</button>
      </form>
    </div>
  );
};

export default DmRoom;