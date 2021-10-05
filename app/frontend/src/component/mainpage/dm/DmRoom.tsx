import React, { FC, useEffect, useState } from "react";
import "../../../scss/dm/DmRoom.scss";
import EasyFetch from "../../../utils/EasyFetch";

interface DMLog {
  time: string,         /* e.g.) "오후 1:42"     */
  msg: string,          /* e.g.) "반갑다"        */
  from: string          /* e.g.) "me" || "hna" */
};

const DmLogList: FC<{dmLog: DMLog[]}> = ({dmLog}) => {

  const [sortedDmLog, setSortedDmLog] = useState<Array<DMLog[]>>([]);

  useEffect(() => {
    let prev = {time: "", from: ""};
    let result: Array<DMLog[]> = [];
    let tmp: DMLog[] = [];
    dmLog.forEach((dm) => {
      if (prev.time === "" && prev.from === "") {
        prev.from = dm.from;
        prev.time = dm.time;
        tmp.push(dm);
        return ;
      }
      if (dm.time === prev.time && dm.from === prev.from) {
        tmp.push(dm);
        return ;
      }
      result.push(tmp);
      tmp = [];
      prev.from = dm.from;
      prev.time = dm.time;
      tmp.push(dm);
    });
    result.push(tmp);
    setSortedDmLog(result);
  }, [dmLog]);

  const printChatLog = (msg: DMLog[]) => {
    return (
      <>
        {msg.map((msg, idx) => {
          return (
            <li key={idx} className={`dm-log ${msg.from === "me" ? "me" : "other"}`}>
              <span className="dm-log-msg">
                {
                  /*! @author yochoi
                    *  @breif 문자열(챗로그)에 개행이 있으면 br태그로 줄바꿈해주는 부분
                    */
                  msg.msg.split('\n').map((chatlog, idx) => {
                    return (<span key={idx}>{chatlog}<br /></span>);
                  })
                }
              </span>
              {idx === 0 && <span className="dm-log-time">{msg.time}</span>}
            </li>
          )
        })}
      </>
    );
  }
  
  return (
    <ul className="dm-log-list">
      {sortedDmLog.map(printChatLog)}
    </ul>
  );
}

interface DmRoomProps {
  dmTarget: string;
}

const DmRoom: FC<DmRoomProps> = ({dmTarget}): JSX.Element => {

  const [dmLog, setDmLog] = useState<DMLog[]>([]);
  const [textAreaMsg, setTextAreaMsg] = useState("");

  /*! @author yochoi
   *  @breif 전송 버튼을 눌렀을 때 dmLog를 갱신함
   *  @todo socket을 이용한 BE 연동
  */
  const sendDm = (e: React.FormEvent) => {
    e.preventDefault();
    if (textAreaMsg === "") return ;
    global.socket.emit("dm", {to: dmTarget, msg: textAreaMsg});
    getDmLog();
    setTextAreaMsg("");
  }

  const controllTextAreaKeyDown = (e: React.KeyboardEvent) => {
    const keyCode = e.key;

    if (keyCode === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendDm(e as React.FormEvent);
    }
  };

  const getDmLog = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/dm-store?receiver_nick=${dmTarget}`);
    const res = await (await easyfetch.fetch()).json();
    setDmLog(res);
  }

  useEffect(() => {
    getDmLog();

    global.socket.on("dm", (dm) => {
      getDmLog();
    });
    return (() => global.socket.off("dm", (dm) => {
      getDmLog();
    }));
  }, []);

  return (
    <div className="dm-room">
      <DmLogList dmLog={dmLog} />
      <form className="dm-form">
        <textarea
          className="dm-msg-textarea"
          placeholder="대화내용 입력"
          rows={4}
          cols={50}
          value={textAreaMsg}
          onChange={({target: {value}}) => setTextAreaMsg(value)}
          onKeyDown={controllTextAreaKeyDown}/>
        <button
          className="dm-msg-button"
          disabled={textAreaMsg === ""}
          onClick={sendDm}>전송</button>
      </form>
    </div>
  );
};

export default DmRoom;