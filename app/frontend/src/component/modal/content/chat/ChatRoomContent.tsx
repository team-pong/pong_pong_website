import React, { FC, Dispatch, SetStateAction, useState, useEffect } from "react";
import { Link, Route, RouteComponentProps, useParams, withRouter } from "react-router-dom";
import Modal from "../../Modal";
import ChatConfigContent from "./ChatConfigContent";
import ChatInviteContent from "./ChatInviteContent";
import ChatContextMenu from "./ChatContextMenu";
import EasyFetch from "../../../../utils/EasyFetch";
import NoResult from "../../../noresult/NoResult";
import Loading from "../../../loading/Loading";
import { io } from "socket.io-client";

function submitMessage(message: string, setMessage: Dispatch<SetStateAction<string>>,
                        chatLog, setChatLog: Dispatch<SetStateAction<any>>) {
  if (message === "") return ;
  setChatLog([{
    nick: "yochoi",
    position: "admin",
    avatar_url: `https://cdn.intra.42.fr/users/medium_yochoi.png`,
    time: new Date().getTime(),
    message: message
  }, ...chatLog]);
  setMessage("");
};

function controlTextAreaKeyDown(e: React.KeyboardEvent,
                          message: string, setMessage: Dispatch<SetStateAction<string>>,
                          chatLog, setChatLog: Dispatch<SetStateAction<any>>) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    submitMessage(message, setMessage, chatLog, setChatLog);
  }
};

function openContextMenu( e: React.MouseEvent,
                          setContextMenu: Dispatch<SetStateAction<any>>,
                          target: string,
                          targetPosition: string) {
  document.getElementById("chat-room-users").style.overflowY = "hidden";
  setContextMenu({
    isOpen: true,
    x: e.pageX,
    y: e.pageY,
    target,
    targetPosition
  });
};

const Password: FC<{setIsProtected: Dispatch<SetStateAction<boolean>>, isMadeMyself: boolean}>
  = ({setIsProtected, isMadeMyself}): JSX.Element => {
  const [password, setPassword] = useState("");

  /*!
   * @author donglee
   * @brief 비밀번호를 입력하면 백엔드 검증 요청 후 대화방을 보여주거나 입장을 거절함
   */
  const submitPassword = (e: React.SyntheticEvent) => {
    e.preventDefault();
    /* TODO: 백엔드에 비밀번호 검증을 API요청하고 결과에 따라 대화방 내부 혹은 알림 메세지를 보여준다. */
  };

  /*!
   * @author donglee
   * @brief 자동으로 비밀번호 input에 focus함
   */
  const inputFocus = () => {
    const input = document.getElementsByClassName("pw-input")[0] as HTMLInputElement;

    input.focus();
  }

  /*!
   * @author donglee
   * @brief - 내가 직접 만든 비공개방 첫 입장 시에는 Password 컴포넌트를 보여주지 않음
   *        - 자동으로 input에 focus함.
   */
  useEffect(() => {
    if (isMadeMyself) {
      setIsProtected(false);
    }
    inputFocus();
  }, []);

  return (
    <div className="pw-container">
      <div className="password-lock-container">
        <img className="password-lock-img" src="/public/protected.png" alt="자물쇠" />
      </div>
      <span className="pw-explain">이 대화방은 비공개방입니다</span>
      <span className="pw-explain">비밀번호를 입력하세요</span>
      <form>
        <input
          className="pw-input"
          type="password"
          minLength={4}
          maxLength={10}
          size={10}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {if (e.key === "Enter") submitPassword(e)}} />
      </form>
    </div>
  );
}

interface ChatRoom {
  title: string,
  type: string,
  current_people: number,
  max_people: number,
  passwd: string,
};

interface ChatLog {
  nick: string,
  position: string,
  avatar_url: string,
  time: number,
  message: string,
};

interface ChatUser {
  nick: string,
  avatar_url: string,
  position: string,
};

const ChatRoomContent: FC<RouteComponentProps> = (props): JSX.Element => {

  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [chatLog, setChatLog] = useState<ChatLog[]>([]);
  const [message, setMessage] = useState("");
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean,
    x: number,
    y: number,
    target: string,
    targetPosition: string
  }>({isOpen: false, x: 0, y: 0, target: "", targetPosition: ""});
  const [noResult, setNoReult] = useState(false);

  const [chatRoomInfo, setChatRoomInfo] = useState<ChatRoom>(null);
  const { channel_id } = useParams<{channel_id: string}>();
  const [isProtected, setIsProtected] = useState(false);
  const [isMadeMyself, setIsMadeMyself] = useState(false);

  /*!
   * @author donglee
   * @brief param으로 넘어온 channel_id로 채팅방 정보 API요청, 결과없으면 NoResult 렌더링
   */
  const getChatRoomInfo = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/chat/oneChat?channel_id=${channel_id}`);
    const res = await (await easyfetch.fetch()).json();

    if (!res.err_msg) {
      setChatRoomInfo({
        title: res.title,
        type: res.type,
        current_people: res.current_people,
        max_people: res.max_people,
        passwd: res.passwd,
      });
    } else {
      setNoReult(true);
    }
    return res;
  }

  const helloToChatRoom = async () => {
    /* TODO: 채팅 입장시 POST 요청 
      CSS: sticky 저 부분 아래 고정되도록 바꿔야 한다.
    */
  }

  const connectSocket = () => {
    const socket = io(`${global.BE_HOST}/chat`);

    socket.emit('join', {room_id: channel_id});
  };

  /*!
   * @author donglee
   * @brief - 내가 직접 만든 비공개방일 경우에는 Password에 props을 줘서 첫 1회만 비번없이 입장 가능하도록 함
   *        - 채팅방 정보를 받아온 후 비공개방일 경우에는 state를 바꿔서 Password 컴포넌트 렌더링 하도록 함
   */
  useEffect(() => {
    if (props.location.state) {
      setIsMadeMyself(true);
    }
    getChatRoomInfo()
    .then((res) => {if (res.type === "protected") setIsProtected(true)})
    .then(() => helloToChatRoom());
    connectSocket();
  }, []);

  if (chatRoomInfo && isProtected) {
    return (
      <Password setIsProtected={setIsProtected} isMadeMyself={isMadeMyself} />
    );
  } else if (chatRoomInfo && !isProtected) {
    return (
      <div id="chat-room">
        <div id="chat-room-header">
          <img
            src="/public/arrow.svg"
            id="arrow-button"
            alt="뒤로가기"
            onClick={() => history.back()} />
          {chatRoomInfo.title}{chatRoomInfo.type === "protected" ? <img id="lock" src="/public/lock-black.svg" alt="비밀방" /> : <></>}
        </div>
        <div id="chat-room-body">
          {
            chatLog.map((value, idx) => {
              const date = new Date(value.time);
              const hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
              const minute = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
              return (
                <div key={idx} className="chat-room-message">
                  <img id="message-avatar" src={value.avatar_url}/>
                  <div id="message-content">
                    <span id="message-nick"><b>{value.nick}</b></span>
                    <span id="message-time">{hour}:{minute}</span>
                    <span id="message-body">{value.message}</span>
                  </div>
                </div>
              );
            })
          }
        </div>
        <div id="chat-room-users">
          {
            chatUsers.map((value, idx) => {
              return (
                <div  key={idx}
                      className="chat-user"
                      onClick={(e) => openContextMenu(e, setContextMenu, value.nick, value.position)}>
                  <img className="chat-room-user-img" src={value.avatar_url} alt={value.nick} />
                  <span className="chat-room-user-nick" >{value.nick}</span>
                  {value.position === "owner" && <img className="position" src={"/public/crown.png"} alt="owner"/>}
                  {value.position === "admin" && <img className="position" src={"/public/knight.png"} alt="admin"/>}
                  {value.position === "mute" && <img className="position" src={"/public/mute.png"} alt="mute"/>}
                </div>
              );
            })
          }
          <div id="chat-room-menu">
            <Link to="/mainpage/chat/invite"><img className="chat-menu-img" src="/public/plus.svg" alt="invite" /></Link>
            <Link to="/mainpage/chat/config"><img className="chat-menu-img" src="/public/tools.svg" alt="config" /></Link>
          </div>
        </div>
        <form className="chat-msg-form">
          <textarea
            className="chat-msg-textarea"
            placeholder="대화내용 입력"
            rows={4}
            cols={50}
            value={message}
            onKeyDown={(e) => controlTextAreaKeyDown(e, message, setMessage, chatLog, setChatLog)}
            onChange={({target: {value}}) => setMessage(value)}/>
          <button className="chat-msg-btn" onClick={() => submitMessage(message, setMessage, chatLog, setChatLog)}>전송</button>
        </form>
        {contextMenu.isOpen && <ChatContextMenu
                                  x={contextMenu.x}
                                  y={contextMenu.y}
                                  myPosition="owner"
                                  targetPosition={contextMenu.targetPosition}
                                  closer={setContextMenu}/>}
        <Route path="/mainpage/chat/config"><Modal id={Date.now()} smallModal content={<ChatConfigContent/>}/></Route>
        <Route path="/mainpage/chat/invite"><Modal id={Date.now()} smallModal content={<ChatInviteContent/>}/></Route>
      </div>
    );
  } 
  if (noResult) {
    return ( <NoResult text="대화방이 존재하지 않습니다."></NoResult> );
  }
  return ( <Loading color="grey" style={{width: "100px", height: "100px", position: "absolute", left: "43%", top: "10%"}} /> );
};

export default withRouter(ChatRoomContent);