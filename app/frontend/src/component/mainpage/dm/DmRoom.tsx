import React, { FC, useEffect, useState, useRef, useContext } from "react";
import { DmInfo, DmInfoContext, SetDmInfoContext, UserInfoContext } from "../../../Context";
import "../../../scss/dm/DmRoom.scss";
import EasyFetch from "../../../utils/EasyFetch";
import Time from "../../../utils/Time";
import { UserInfo } from "../MainPage";

interface DMLog {
  time: string, /* e.g.) "2021-07-31T05:41:48.342Z" */
  msg: string,  /* e.g.) "반갑다" */
  from: string, /* e.g.) "me" || "hna" */
  type: string, /* e.g.) "normal" || "chat"(대화방 초대) || "game"(게임 초대) */
};

const DmLogList: FC<{dmLog: DMLog[], myInfo: UserInfo}> = ({dmLog, myInfo}) => {

  const [sortedDmLog, setSortedDmLog] = useState<Array<DMLog[]>>([]);
  const requestRef = useRef<HTMLDivElement>(null);

  /*!
   * @author donglee
   * @breif 대화방 초대를 승낙하면 해당 channelId를 이용해 redirect함
   */
  const approveChatInvite = (channelId: number) => {
    console.log("channelId: ", channelId);
    /* Redirect 하는 코드 */
  };

  /*!
   * @author donglee
   * @breif 대화방 초대를 거절하면 css디자인을 바꿔서 클릭이벤트가 발생하지 않도록 함
   */
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

  /*!
   * @author yochoi, donglee
   * @breif 초대메세지와 normal메세지를 나눠서 화면에 렌더링함
   */
  const printChatLog = (msg: DMLog[], idx: number) => {
    if (msg[0] && msg[0].type === "chat") {
      const parsedMsg = JSON.parse(msg[0].msg);
      
      return (
        <div key={idx} className={`dm-request-container ${msg[0].from === myInfo.nick ? "other" : "me"}`}>
          <div className="dm-invitation-part" ref={requestRef}>
            <span className="dm-request-msg">{msg[0].from} 님이 {parsedMsg.chatTitle} 대화방에 초대했습니다.</span>
            <div className="dm-request-btn-container">
              <div className="dm-request-approve">
                <img
                  className="dm-reply-img"
                  src="/public/green-check.png"
                  alt="승낙"
                  onClick={() => approveChatInvite(parsedMsg.channelId)} />
              </div>
              <div className="dm-request-reject">
                <img
                  className="dm-reply-img"
                  src="/public/red-x.png" 
                  alt="거절"
                  onClick={rejectChatInvite} />
              </div>
            </div>
          </div>
          <span className="dm-request-time">{msg[0].time}</span>
        </div>
      );
    } else {
      return (
        <div key={idx}>
          {msg.map((msg, idx) => {
            return (
              <li key={idx} className={`dm-log ${msg.from === myInfo.nick ? "me" : "other"}`}>
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
  const setDmInfo = useContext(SetDmInfoContext);
  const myInfo = useContext(UserInfoContext);
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

  /*!
   * @author donglee
   * @breif dmInfo의 request가 null이 아닐 때 소켓으로 데이터를 전달하고
   *        즉시 다른 값은 그대로지만 request값을 null로 바꿔준다.
   *        전역객체이므로 null로 바꿔주지 않으면 계속 유지되기 때문임
   */
  const sendRequest = () => {
    global.socket.emit("chatInvite", {
      from: dmInfo.request.from,
      target: dmInfo.target,
      chatTitle: dmInfo.request.chatTitle,
      channelId: dmInfo.request.channelId,
    });
    setDmInfo({
      isDmOpen: dmInfo.isDmOpen,
      target: dmInfo.target,
      request: null,
    });
    getDmLog();
  };
  /* TODO: 문제가 뭔지 잘 모르겠다. 초대를 보낸 후 부터는 그 즉시 DM을 보내도 가질 않는다
  DB에는 정상적으로 저장이 되는데 렌더링이 안 된다. 
  기본적으로 DM에 문제가 있는데 디버깅을 통해서 어떻게 처리가 되는지를 분석해야한다. */

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

    console.log("getDmLog: ", res);
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
      setDmLog([{...request}, ...dmLogRef.current]);
      console.log("ChatInviteOn from socket: ", request);
      console.log("chatInviteOn current dmLog: ", dmLogRef.current);
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
      <DmLogList dmLog={dmLog} myInfo={myInfo}/>
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
