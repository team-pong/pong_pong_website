import React, { FC, useEffect, useState, Dispatch, SetStateAction } from "react";
import "../../../scss/dm/DmRoom.scss";
import { testDMLog, DMLog } from "../../../dummydata/testDM";

const DmLogList: FC<{dmLog: DMLog[]}> = ({dmLog}) => {
  return (
    <ul className="dm-log-list">
      {
        dmLog?.map((msg, idx) => {
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
              <span className="dm-log-time">{msg.time}</span>
            </li>
          );
        })
      }
    </ul>
  );
}

interface DmRoomProps {
  dmTarget: string;
}

const DmRoom: FC<DmRoomProps> = ({dmTarget}): JSX.Element => {

  const [dmLog, setDmLog] = useState<DMLog[]>(null);
  const [textAreaMsg, setTextAreaMsg] = useState("");

  /*! @author yochoi
   *  @breif 전송 버튼을 눌렀을 때 dmLog를 갱신함
   *  @todo socket을 이용한 BE 연동
  */
  const sendDm = (e: React.FormEvent) => {
    e.preventDefault();
    if (textAreaMsg === "") return ;
    setDmLog([{
      time: "오후 05:05",
      msg: textAreaMsg,
      from: "me"
    }, ...dmLog]);
    setTextAreaMsg("");
  }

  const controllTextAreaKeyDown = (e: React.KeyboardEvent) => {
    const keyCode = e.key;

    if (keyCode === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendDm(e as React.FormEvent);
    }
  };

  useEffect(() => {
    setDmLog(testDMLog);
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