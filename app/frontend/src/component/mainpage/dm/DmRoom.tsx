import React, { FC, useEffect, useState, useRef } from "react";
import "../../../scss/dm/DmRoom.scss";
import EasyFetch from "../../../utils/EasyFetch";
import Time from "../../../utils/Time";

interface DMLog {
  time: string,         /* e.g.) "2021-07-31T05:41:48.342Z"     */
  msg: string,          /* e.g.) "반갑다"        */
  from: string          /* e.g.) "me" || "hna" */
};

const DmLogList: FC<{dmLog: DMLog[]}> = ({dmLog}) => {

  const [sortedDmLog, setSortedDmLog] = useState<Array<DMLog[]>>([]);

  /*!
  * @author yochoi
  * @breif  dmLog를 돌면서 이전 메세지와 같은 사람, 같은 시간에 보낸 메세지면
  *         같은 그룹으로 묶어주는 함수
  */
  useEffect(() => {
    let prev = {time: "", from: ""};
    let result: Array<DMLog[]> = [];
    let tmp: DMLog[] = [];
    const date = new Time(new Date().toString());
    dmLog.forEach((dm) => {
      date.setTime(dm.time);
      dm.time = `${date.getTimeFormat()} ${date.getHour()}:${date.getMinuate()}`
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

  const printChatLog = (msg: DMLog[], idx: number) => {
    return (
      <div key={idx}>
        {msg.map((msg, idx) => {
          return (
            <li key={idx} className={`dm-log ${msg.from === "me" ? "me" : "other"}`}>
              <span className="dm-log-msg">
                {
                  /*!
                    * @author yochoi
                    * @breif 문자열(챗로그)에 개행이 있으면 br태그로 줄바꿈해주는 부분
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
      </div>
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

  const [dmLog, _setDmLog] = useState<DMLog[]>([]);
  const dmLogRef = useRef(dmLog);
  const setDmLog = (x) => {
    dmLogRef.current = x;
    _setDmLog(x);
  }

  const [textAreaMsg, setTextAreaMsg] = useState("");

  /*! 
   * @author yochoi
   * @breif 전송 버튼을 눌렀을 때 dmLog를 갱신함
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
    const res = await easyfetch.fetch();
    setDmLog(res);
  }

  useEffect(() => {
    getDmLog();

    const dmOn = (dm) => {
      setDmLog([{...dm}, ...dmLogRef.current]);
    }
    global.socket.on("dm", dmOn);
    return (() => global.socket.off("dm", dmOn));
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
          onKeyPress={controllTextAreaKeyDown}/>
        <button
          className="dm-msg-button"
          disabled={textAreaMsg === ""}
          onClick={sendDm}>전송</button>
      </form>
    </div>
  );
};

export default DmRoom;