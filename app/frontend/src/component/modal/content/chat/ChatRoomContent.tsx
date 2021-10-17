import React, { FC, Dispatch, SetStateAction, useState, useEffect, useContext, useRef } from "react";
import { Link, Route, RouteComponentProps, useParams, withRouter } from "react-router-dom";
import Modal from "../../Modal";
import ChatInviteContent from "./ChatInviteContent";
import ChatContextMenu from "./ChatContextMenu";
import EasyFetch from "../../../../utils/EasyFetch";
import NoResult from "../../../noresult/NoResult";
import Loading from "../../../loading/Loading";
import ConfigChatRoom from "./ConfigChatRoom";
import { io, Socket } from "socket.io-client";
import { UserInfoContext } from "../../../../Context";
import { UserInfo } from "../../../mainpage/MainPage";


function submitMessage(myInfo: UserInfo, message: string, chatLog: ChatLog[], setChatLog: Dispatch<SetStateAction<any>>) {
  if (message === "") return ;
  setChatLog([{
    nick: myInfo.nick,
    position: "normal",
    avatar_url: myInfo.avatar_url,
    time: new Date().getTime(),
    message: message
  }, ...chatLog]);
};

function controlTextAreaKeyDown(e: React.KeyboardEvent, myInfo: UserInfo,
                          message: string, setMessage: Dispatch<SetStateAction<string>>,
                          chatLog: ChatLog[], setChatLog: Dispatch<SetStateAction<any>>, socket: Socket) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    if (message === "") return ;
    submitMessage(myInfo, message, chatLog, setChatLog);
    socket.emit("message", message);
    setMessage("");
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

const Password: FC<{
  setIsProtected: Dispatch<SetStateAction<boolean>>,
  isMadeMyself: boolean,
  channelId: string,
  setPasswordPassed: Dispatch<SetStateAction<boolean>>,}>
  = ({setIsProtected, isMadeMyself, channelId, setPasswordPassed}): JSX.Element => {

  const [password, setPassword] = useState("");

  /*!
   * @author donglee
   * @brief 비밀번호를 입력하면 백엔드 검증 요청 후 대화방을 보여주거나 입장을 거절함
   */
  const submitPassword = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const easyfetch = new EasyFetch(`${global.BE_HOST}/chat/checkPasswd?channel_id=${channelId}&passwd=${password}`);
    const res = await easyfetch.fetch();

    if (res) {
      setIsProtected(false);
      setPasswordPassed(true);
    } else {
      alert("비밀번호가 틀렸습니다.");
    }
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

export interface ChatRoom {
  title: string,
  type: string,
  current_people: number,
  max_people: number,
  passwd: string,
  channel_id: number,
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

interface ChatRoomContentProps {
  isMadeMyself: boolean;
  setIsMadeMyself: Dispatch<SetStateAction<boolean>>;
};

const ChatRoomContent: FC<ChatRoomContentProps & RouteComponentProps> = ({isMadeMyself, setIsMadeMyself}): JSX.Element => {

  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [chatLog, _setChatLog] = useState<ChatLog[]>([]);
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
  const [socket, setSocket] = useState<Socket>(null);
  const chatLogRef = useRef(chatLog);
  const [passwordPassed, setPasswordPassed] = useState(false);

  const myInfo = useContext(UserInfoContext);

  /*!
   * @author donglee
   * @brief 웹소켓에서 이벤트리스너에 최신화된 chatLog state에 접근하기 위해서 ref훅을 사용함
   */
  const setChatLog = (data) => {
    chatLogRef.current = data;
    _setChatLog(data);
  };

  /*!
   * @author donglee
   * @brief param으로 넘어온 channel_id로 채팅방 정보 API요청, 결과없으면 NoResult 렌더링
   */
  const getChatRoomInfo = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/chat/oneChat?channel_id=${channel_id}`);
    const res = await easyfetch.fetch();
    
    if (!res.err_msg) {
      setChatRoomInfo({
        title: res.title,
        type: res.type,
        current_people: res.current_people,
        max_people: res.max_people,
        passwd: res.passwd,
        channel_id: res.channel_id,
      });
    } else {
      setNoReult(true);
    }
    return res;
  };

  const connectSocket = () => {
    const socket = io(`${global.BE_HOST}/chat`);

    socket.emit('join', {room_id: channel_id});
    return socket;
  };

  /*!
   * @author donglee
   * @brief socket state가 처음에 연결되면 리스너들을 등록함
   */
  useEffect(() => {
    if (socket) {
      /*!
       * @author donglee
       * @brief 메세지를 받았을 때 chatLog를 최신화해서 렌더링함
       */
      socket.on("message", (data: ChatLog & {user: string, chat: string}) => {
        if (data.user) {
          return ;
        }
        setChatLog([{
          nick: data.nick,
          position: "admin",
          avatar_url: data.avatar_url,
          time: data.time,
          message: data.message
        }, ...chatLogRef.current]);
      });
  
      /*!
       * @author donglee
       * @brief 대화방 정보가 변경될 경우 방 정보를 최신화함
       */
      socket.on("setRoomInfo", (data: ChatRoom) => {
        const roomInfo = {
          title: data.title,
          type: data.type,
          current_people: data.current_people,
          max_people: data.max_people,
          passwd: data.passwd,
          channel_id: data.channel_id,
        };
        setChatRoomInfo(roomInfo);
      });
  
      /*!
       * @author donglee
       * @brief 대화방에 참여중인 사용자들이 변경될 때 최신화해서 렌더링함
       */
      socket.on("setRoomUsers", (data: ChatUser[]) => {
        const users = [...data];
        setChatUsers(users);
      });
    }

    return (() => {
      if (socket) socket.disconnect();
    })
  }, [socket]);

  /*!
   * @author donglee
   * @brief password를 입력하면 passwordPassed가 true가 되면서 소켓을 연결함
   */
  useEffect(() => {
    if (passwordPassed) {
      const socket = connectSocket();
      setSocket(socket);
    }
  }, [passwordPassed]);

  /*!
   * @author donglee
   * @brief 내가 만든 방일 경우에 처음 한 번만 비밀번호 없이 입장할 수 있도록 소켓을 연결함
   */
  useEffect(() => {
    if (isMadeMyself) {
      const socket = connectSocket();
      setSocket(socket);
    }
  }, [isMadeMyself]);

  /*!
   * @author donglee
   * @brief - 내가 직접 만든 비공개방일 경우에는 Password에 props을 줘서 첫 1회만 비번없이 입장 가능하도록 함
   *        - 채팅방 정보를 받아온 후 비공개방일 경우에는 state를 바꿔서 Password 컴포넌트 렌더링 하도록 함
   *        - protected 가 아닌 대화방의 경우는 바로 소켓 연결함
   *        - clean-up : 내가 만든 방을 최초 1회만 적용하기 위해서 false로 값을 바꿔줌
   */
  useEffect(() => {
    getChatRoomInfo()
    .then((res) => {
        if (res.type === "protected") {
          setIsProtected(true);
        } else {
          const socket = connectSocket();
          setSocket(socket);
        }
      }
    );

    return (() => {
      setIsMadeMyself(false);
    });
  }, []);

  if (chatRoomInfo && isProtected) {
    return (
      <Password
        setIsProtected={setIsProtected}
        isMadeMyself={isMadeMyself}
        channelId={channel_id}
        setPasswordPassed={setPasswordPassed}/>
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
          <span className="chat-room-participants">
            참여자: {chatRoomInfo.current_people} / {chatRoomInfo.max_people}
          </span>
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
            onKeyPress={(e) => controlTextAreaKeyDown(e, myInfo, message, setMessage, chatLog, setChatLog, socket)}
            onChange={({target: {value}}) => setMessage(value)}/>
          <button className="chat-msg-btn" onClick={() => submitMessage(myInfo, message, chatLog, setChatLog)}>전송</button>
        </form>
        {contextMenu.isOpen && <ChatContextMenu
                                  x={contextMenu.x}
                                  y={contextMenu.y}
                                  myPosition="owner"
                                  targetPosition={contextMenu.targetPosition}
                                  closer={setContextMenu}/>}
        <Route path="/mainpage/chat/config">
          <Modal id={Date.now()} smallModal content={
            <ConfigChatRoom 
              chatRoomInfo={chatRoomInfo}
              channelIdToBeSet={`${chatRoomInfo.channel_id}`}
              setIsMadeMyself={setIsMadeMyself}
              setChatRoomInfo={setChatRoomInfo}/>
            } />
        </Route>
        <Route path="/mainpage/chat/invite"><Modal id={Date.now()} smallModal content={<ChatInviteContent/>}/></Route>
      </div>
    );
  } 
  if (noResult) {
    return ( <NoResult
      text="대화방이 존재하지 않습니다."
      style={{display: "block",
              marginLeft: "190px",
              marginTop: "100px",
              fontSize: "20pt"}} />
    );
  }
  return ( <Loading color="grey" style={{width: "100px", height: "100px", position: "absolute", left: "43%", top: "10%"}} /> );
};

export default withRouter(ChatRoomContent);