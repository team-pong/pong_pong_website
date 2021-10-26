import React, { FC, useEffect, useState, useRef } from "react";
import { DmInfo } from "../../../Context";
import "../../../scss/dm/DmRoom.scss";
import EasyFetch from "../../../utils/EasyFetch";
import Time from "../../../utils/Time";

interface DMLog {
  time: string, /* e.g.) "2021-07-31T05:41:48.342Z" */
  msg: string,  /* e.g.) "반갑다" */
  from: string, /* e.g.) "me" || "hna" */
  type: string, /* e.g.) "normal" || "chat"(대화방 초대) || "game"(게임 초대) */
};

const DmLogList: FC<{dmLog: DMLog[], dmInfo: DmInfo}> = ({dmLog, dmInfo}) => {

  const [sortedDmLog, setSortedDmLog] = useState<Array<DMLog[]>>([]);
  const requestRef = useRef<HTMLDivElement>(null);

  const approveChatInvite = () => {
    /* Redirect 하는 코드 */
  };

  const rejectChatInvite = () => {
    requestRef.current.className += " dm-deactivate-request";
    /* 여기서 문제는 연속으로 여러 개의 request가 오면 하나만 눌러도
    전부 다 거절 처리가 될 것이다. 어떻게 해결해야 할까? */
  }

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
      let tmpTime = `${date.getTimeFormat()} ${date.getHour()}:${date.getMinuate()}`
      if (prev.time === "" && prev.from === "") {
        prev.from = dm.from;
        prev.time = tmpTime;
        tmp.unshift({...dm, time: tmpTime});
        return ;
      }
      if (tmpTime === prev.time && dm.from === prev.from) {
        tmp.unshift({...dm, time: tmpTime});
        return ;
      }
      result.push(tmp);
      tmp = [];
      prev.from = dm.from;
      prev.time = tmpTime;
      tmp.push({...dm, time: tmpTime});
    });
    result.push(tmp);
    setSortedDmLog(result);
  }, [dmLog]);

  const printChatLog = (msg: DMLog[], idx: number) => {
    // if (msg[0].type === "chat") {
    //   return (
    //     <div key={idx} className="dm-request-container">
    //       <div className="dm-invitation-part" ref={requestRef}>
    //         <span className="dm-request-msg">{dmInfo.request.from} 님이 {dmInfo.request.chatTitle} 대화방에 당신을 초대했습니다.</span>
    //         <div className="dm-request-btn-container">
    //           <div className="dm-request-approve">
    //             <img
    //               className="dm-reply-img"
    //               src="/public/green-check.png"
    //               alt="승낙"
    //               onClick={approveChatInvite} />
    //           </div>
    //           <div className="dm-request-reject">
    //             <img
    //               className="dm-reply-img"
    //               src="/public/red-x.png" 
    //               alt="거절"
    //               onClick={rejectChatInvite} />
    //           </div>
    //         </div>
    //       </div>
    //       <span className="dm-request-time">{msg[0].time}</span>
    //     </div>
    //   );
    // }

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
  dmInfo: DmInfo;
}

const DmRoom: FC<DmRoomProps> = ({dmInfo}): JSX.Element => {

  const [dmLog, _setDmLog] = useState<DMLog[]>([]);
  const dmLogRef = useRef(dmLog);
  const setDmLog = (x) => {
    dmLogRef.current = x;
    _setDmLog(x);
  };

  const [textAreaMsg, setTextAreaMsg] = useState("");

  /*! 
   * @author yochoi
   * @breif 전송 버튼을 눌렀을 때 dmLog를 갱신함
  */
  const sendDm = (e: React.FormEvent) => {
    e.preventDefault();
    if (textAreaMsg === "") return ;
    global.socket.emit("dm", {to: dmInfo.target, msg: textAreaMsg});
    getDmLog();
    setTextAreaMsg("");
  }

  const sendRequest = () => {
    global.socket.emit("chatInvite", {
      from: dmInfo.request.from,
      target: dmInfo.target,
      chatTitle: dmInfo.request.chatTitle,
      channelId: dmInfo.request.channelId,
    });
  };

  const controllTextAreaKeyDown = (e: React.KeyboardEvent) => {
    const keyCode = e.key;

    if (keyCode === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendDm(e as React.FormEvent);
    }
  };

  const getDmLog = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/dm-store?receiver_nick=${dmInfo.target}`);
    const res = await easyfetch.fetch();
    setDmLog(res);
  }

  useEffect(() => {
    getDmLog();

    if (dmInfo.request) {
      sendRequest();
    }
    const dmOn = (dm) => {
      setDmLog([{...dm}, ...dmLogRef.current]);
    }

    const chatInviteOn = (request) => {
      // setDmLog([{...request}, ...dmLogRef.current]);
      console.log("from socket: ", request);
      console.log("chatInviteOn: ", dmLogRef.current);
    }

    global.socket.on("dm", dmOn);
    global.socket.on("chatInvite", chatInviteOn);
    return (() => {
      global.socket.off("dm", dmOn);
      global.socket.off("chatInvite", chatInviteOn);
    });
  }, []);

  return (
    <div className="dm-room">
      <DmLogList dmLog={dmLog} dmInfo={dmInfo}/>
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
