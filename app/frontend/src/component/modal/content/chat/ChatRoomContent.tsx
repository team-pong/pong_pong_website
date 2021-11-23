import React, { FC, Dispatch, SetStateAction, useState, useEffect, useContext, useRef } from "react";
import { Link, Route, RouteComponentProps, useParams, withRouter } from "react-router-dom";
import Modal, { GameContent } from "../../Modal";
import ChatInviteContent from "./ChatInviteContent";
import ChatContextMenu from "./ChatContextMenu";
import EasyFetch from "../../../../utils/EasyFetch";
import NoResult from "../../../noresult/NoResult";
import Loading from "../../../loading/Loading";
import ConfigChatRoom from "./ConfigChatRoom";
import { io, Socket } from "socket.io-client";
import { SetDmInfoContext, SetNoticeInfoContext, UserInfoContext } from "../../../../Context";
import { UserInfo } from "../../../mainpage/MainPage";
import ProfileContent from "../profile/ProfileContent";
import { NOTICE_RED } from "../../../mainpage/navbar/addFriend/AddFriend";
import GameSpectateContent from "../game/GameSpectateContent";

/*!
 * @author donglee
 * @brief Enter를 누르거나 버튼을 클릭했을 때 메세지를 제출하고 state를 업데이트함.(mute 검사)
 */
function submitMessage(e: any, myInfo: UserInfo,
                          message: string, setMessage: Dispatch<SetStateAction<string>>,
                          chatLog: (ChatLog | ChatLogSystem)[],
                          setChatLog: Dispatch<SetStateAction<any>>,
                          socket: Socket, myPosition: string, myState: string,
                          setNoticeInfo: Dispatch<SetStateAction<any>>) {
  if ((e.key === "Enter" && !e.shiftKey) || e.type === "click") {
    e.preventDefault();
    if (message === "") return ;
    if (myState === "mute") {
      setNoticeInfo({
        isOpen: true,
        seconds: 3,
        content: "관리자가 당신을 차단했습니다.",
        backgroundColor: NOTICE_RED,
      });
      return ;
    }
    setChatLog([{
      nick: myInfo.nick,
      position: myPosition,
      avatar_url: myInfo.avatar_url,
      time: new Date().getTime(),
      message: message
    }, ...chatLog]);
    socket.emit("message", {msg: message});
    setMessage("");
  }
};

function openContextMenu( e: React.MouseEvent,
                          setContextMenu: Dispatch<SetStateAction<any>>,
                          target: string,
                          targetPosition: string,
                          targetState: string,
                          targetAvatar: string,
                          targetStatus: string) {
  document.getElementById("chat-room-users").style.overflowY = "hidden";
  setContextMenu({
    isOpen: true,
    x: e.pageX,
    y: e.pageY,
    target,
    targetPosition,
    targetState,
    targetAvatar,
    targetStatus,
  });
};

const Password: FC<{
  setIsProtected: Dispatch<SetStateAction<boolean>>,
  isMadeMyself: boolean,
  channelId: string,
  setPasswordPassed: Dispatch<SetStateAction<boolean>>,}>
  = ({setIsProtected, isMadeMyself, channelId, setPasswordPassed}): JSX.Element => {

  const [password, setPassword] = useState("");
  const setNoticeInfo = useContext(SetNoticeInfoContext);

  const mounted = useRef(false);

  /*!
   * @author donglee
   * @brief 비밀번호를 입력하면 백엔드 검증 요청 후 대화방을 보여주거나 입장을 거절함
   */
  const submitPassword = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const easyfetch = new EasyFetch(`${global.BE_HOST}/chat/checkPasswd?channel_id=${channelId}&passwd=${password}`);
    const res = await easyfetch.fetch();

    if (res) {
      if (mounted.current) {
        setIsProtected(false);
        setPasswordPassed(true);
      }
    } else {
      setNoticeInfo({
        isOpen: true,
        seconds: 3,
        content: "비밀번호가 틀렸습니다.",
        backgroundColor: NOTICE_RED,
      });
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
    mounted.current = true;
    if (isMadeMyself) {
      setIsProtected(false);
    }
    inputFocus();
    return (() => {mounted.current = false});
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

interface ChatLogSystem {
  inform: string,
}

export interface ChatUser {
  nick: string,
  avatar_url: string,
  position: string,
  state: string,
  status: string,
};

interface ChatRoomContentProps {
  isMadeMyself: boolean;
  setIsMadeMyself: Dispatch<SetStateAction<boolean>>;
};

const ChatRoomContent: FC<ChatRoomContentProps & RouteComponentProps> = (
  {isMadeMyself, setIsMadeMyself, match, location}): JSX.Element => {

  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [chatLog, _setChatLog] = useState<(ChatLog | ChatLogSystem)[]>([]);
  const [message, setMessage] = useState("");
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean,
    x: number,
    y: number,
    target: string,
    targetPosition: string,
    targetState: string,
    targetAvatar: string,
    targetStatus: string,
  }>({isOpen: false, x: 0, y: 0, target: "", targetPosition: "", targetState: "", targetAvatar: "", targetStatus: ""});
  const [noResult, setNoReult] = useState(false);

  const [chatRoomInfo, setChatRoomInfo] = useState<ChatRoom>(null);
  const { channel_id } = useParams<{channel_id: string}>();
  const [isProtected, setIsProtected] = useState(false);
  const [socket, _setSocket] = useState<Socket>(null);
  const chatLogRef = useRef(chatLog);
  const [passwordPassed, setPasswordPassed] = useState(false);
  const socketRef = useRef(socket);
  const [myState, setMyState] = useState("");
  const [myPosition, setMyPosition] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const myInfo = useContext(UserInfoContext);
  const setDmInfo = useContext(SetDmInfoContext);
  const setNoticeInfo = useContext(SetNoticeInfoContext);

  const mounted = useRef(false);

  /*!
   * @author donglee
   * @brief 웹소켓에서 이벤트리스너에 최신화된 chatLog state에 접근하기 위해서 ref훅을 사용함
   */
  const setChatLog = (data: (ChatLog | ChatLogSystem)[]) => {
    chatLogRef.current = data;
    _setChatLog(data);
  };

  /*!
   * @author donglee
   * @brief useEffect 에서 socket state가 null이어서 current로 참조하기 위함
   */
  const setSocket = (data: Socket) => {
    socketRef.current = data;
    _setSocket(data);
  }

  /*!
   * @author donglee
   * @brief param으로 넘어온 channel_id로 채팅방 정보 API요청, 결과없으면 NoResult 렌더링
   */
  const getChatRoomInfo = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/chat/oneChat?channel_id=${channel_id}`);
    const res = await easyfetch.fetch();
    if (!res.err_msg) {
      if (mounted.current) setChatRoomInfo({
        title: res.title,
        type: res.type,
        current_people: res.current_people,
        max_people: res.max_people,
        passwd: res.passwd,
        channel_id: res.channel_id,
      });
    } else {
      if (mounted.current) setNoReult(true);
    }
    return res;
  };

  /*!
   * @author donglee
   * @brief socket을 연결함. 연결하기 전에 ban당한 유저인지를 확인하고 ban당했으면 뒤로가기후 alert.
   */
  const connectSocket = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/ban?channel_id=${channel_id}&nick=${myInfo.nick}`);
    const res = await easyfetch.fetch()

    if (res.bool) {
      history.back();
      throw ("현재 대화방에서 강제퇴장 당해 입장할 수 없습니다. 잠시 후에 다시 시도하십시오.");
    }
    const socket = io(`${global.BE_HOST}/chat`);

    socket.emit('join', {room_id: channel_id});
    return socket;
  };

  /*!
   * @author donglee
   * @brief 대화방에 인원이 꽉 차 있으면 입장을 불가하게 함
   * @troubleShooting res에 type을 Promise<ChatRoom> 또는 ChatRoom으로 지정하면 뒤로가기를 눌렀을 때
   *                  메모리릭 에러가 발생함.
   */
  const checkMax = async (res) => {
    if (res.max_people <= res.current_people) {
      history.back();
      throw("대화방에 남은 자리가 없습니다.");
    } 
    return res;
  };

  useEffect(() => {
    mounted.current = true;
    return (() => {mounted.current = false});
  }, [])

  /*!
   * @author donglee
   * @brief myState가 바뀔 때마다 강제퇴장을 검사한다.
   */
  useEffect(() => {
    if (myState === "ban") {
      history.back();
      socket.disconnect();
      setNoticeInfo({
        isOpen: true,
        seconds: 3,
        content: "강제 퇴장 당했습니다.",
        backgroundColor: NOTICE_RED,
      });
    }
  }, [myState]);

  /*!
   * @author donglee
   * @brief 소켓으로 chatUsers 정보가 변경되면 myPosition, myState를 업데이트함
   */
  useEffect(() => {
    if (chatUsers.length !== 0) {
      const me = chatUsers.filter((user) => user.nick === myInfo.nick);
      if (me[0]) {
        setMyPosition(me[0].position);
        setMyState(me[0].state);
      }
    }
  }, [chatUsers])

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
          setChatLog([{
            inform: data.chat,
          }, ...chatLogRef.current]);
        } else {
          setChatLog([{
            nick: data.nick,
            position: data.position,
            avatar_url: data.avatar_url,
            time: data.time,
            message: data.message
          }, ...chatLogRef.current]);
        }
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
  }, [socket]);

  /*!
   * @author donglee
   * @brief password를 입력하면 passwordPassed가 true가 되면서 소켓을 연결함
   */
  useEffect(() => {
    if (passwordPassed) {
      connectSocket().then((socket) => {
        setSocket(socket)
      }).catch((err) => {
        setNoticeInfo({
          isOpen: true,
          seconds: 3,
          content: err,
          backgroundColor: NOTICE_RED,
        });
      });
    }
  }, [passwordPassed]);

  /*!
   * @author donglee
   * @brief 내가 만든 방일 경우에 처음 한 번만 비밀번호 없이 입장할 수 있도록 소켓을 연결함
   */
  useEffect(() => {
    if (isMadeMyself) {
      connectSocket().then((socket) => {
        setSocket(socket)
      }).catch((err) => {
        setNoticeInfo({
          isOpen: true,
          seconds: 3,
          content: err,
          backgroundColor: NOTICE_RED,
        });
      });
    }
  }, [isMadeMyself]);

  /*!
   * @author donglee
   * @brief - 대화방에서 초대돼서 온 거라면 DM 컴포넌트를 닫아줌
   *        - 방의 인원이 가득 차있는지를 검사
   *        - 내가 직접 만든 비공개방일 경우에는 Password에 props을 줘서 첫 1회만 비번없이 입장 가능하도록 함
   *        - 채팅방 정보를 받아온 후 비공개방일 경우에는 state를 바꿔서 Password 컴포넌트 렌더링 하도록 함
   *        - protected 가 아닌 대화방의 경우는 바로 소켓 연결함
   *        - clean-up : 내가 만든 방을 최초 1회만 적용하기 위해서 false로 값을 바꿔줌
   *        - 방이 private이면 state를 set해서 span을 렌더링함
   */
  useEffect(() => {
    if (location.state) {
      setDmInfo({
        isDmOpen: false,
        target: "",
      });
    }
    if (myInfo.nick) {
      getChatRoomInfo()
        .then(checkMax)
        .then((res) => {
            if (res.type === "protected") {
              if (mounted.current) setIsProtected(true);
            } else {
              connectSocket().then((socket) => {
                if (mounted.current) setSocket(socket);
              }).catch((err) => {
                setNoticeInfo({
                  isOpen: true,
                  seconds: 3,
                  content: err,
                  backgroundColor: NOTICE_RED,
                });
              });
            }
            if (res.type === "private") {
              if (mounted.current) setIsPrivate(true);
            }
          }
        ).catch((err) => {
          setNoticeInfo({
            isOpen: true,
            seconds: 3,
            content: err,
            backgroundColor: NOTICE_RED,
          });
      });
    }

    return (() => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      setIsMadeMyself(false);
    });
  }, [myInfo]);

  if (chatRoomInfo && isProtected) {
    return (
      <Password
        setIsProtected={setIsProtected}
        isMadeMyself={isMadeMyself}
        channelId={channel_id}
        setPasswordPassed={setPasswordPassed}/>
    );
  }
  if (chatRoomInfo && !isProtected) {
    return (
      <div id="chat-room">
        {isPrivate && <span className="chat-room-private">이 방은 비밀방입니다</span>}
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
            chatLog.map((value: ChatLog & ChatLogSystem, idx) => {
              if (value.inform) {
                return (
                  <div key={idx} className="message-inform chat-room-message">
                    <span>{value.inform}</span>
                  </div>
                );
              } else {
                const date = new Date(value.time);
                const hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
                const minute = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
                return (
                  <div key={idx} className="chat-room-message">
                    <img id="message-avatar" src={value.avatar_url}/>
                    <div id="message-content">
                      <span id="message-nick">
                        <b>{value.nick}</b>
                      </span>
                      {value.position === "owner" ? 
                        <img className="message-status" src="/public/crown.png" alt="owner"/> : <></>}
                      {value.position === "admin" ?
                        <img className="message-status" src="/public/knight.png" alt="admin"/> : <></>}
                      <span id="message-time">{hour}:{minute}</span>
                      <span id="message-body">{value.message}</span>
                    </div>
                  </div>
                );
              }
            })
          }
        </div>
        <div id="chat-room-users">
          {
            chatUsers.map((value, idx) => {
              return (
                <div key={idx}
                      className={"chat-user" + (value.nick === myInfo.nick ? " chat-user-me" : "")}
                      onClick={(e) => openContextMenu(e, setContextMenu, value.nick, value.position, value.state, value.avatar_url, value.status)}>
                  <img className="chat-room-user-img" src={value.avatar_url} alt={value.nick} />
                  <span className="chat-room-user-nick">{value.nick}</span>
                  {value.position === "owner" && <img className="position" src={"/public/crown.png"} alt="owner"/>}
                  {value.position === "admin" && <img className="position" src={"/public/knight.png"} alt="admin"/>}
                  {value.state === "mute" && <img className="position" src={"/public/mute.png"} alt="mute"/>}
                </div>
              );
            })
          }
          <span className="chat-room-participants">
            참여자: {chatRoomInfo.current_people} / {chatRoomInfo.max_people}
          </span>
          <div id="chat-room-menu">
            <Link to={`${match.url}/invite`}><img className="chat-menu-img" src="/public/plus.svg" alt="invite" /></Link>
            {myPosition === "owner" ?
            <Link to={`${match.url}/config`}><img className="chat-menu-img" src="/public/tools.svg" alt="config" /></Link>
            : <></>}
          </div>
        </div>
        <form className="chat-msg-form">
          <textarea
            className="chat-msg-textarea"
            placeholder="대화내용 입력"
            rows={4}
            cols={50}
            value={message}
            onKeyPress={(e) => submitMessage(e, myInfo, message, setMessage, chatLog, setChatLog, socket, myPosition, myState, setNoticeInfo)}
            onChange={({target: {value}}) => setMessage(value)}/>
          <button className="chat-msg-btn" onClick={(e) => submitMessage(e, myInfo, message, setMessage, chatLog, setChatLog, socket, myPosition, myState, setNoticeInfo)}>전송</button>
        </form>
        {contextMenu.isOpen && <ChatContextMenu
                                  x={contextMenu.x}
                                  y={contextMenu.y}
                                  myPosition={myPosition}
                                  targetPosition={contextMenu.targetPosition}
                                  targetState={contextMenu.targetState}
                                  closer={setContextMenu}
                                  target={contextMenu.target}
                                  socket={socket}
                                  targetAvatar={contextMenu.targetAvatar}
                                  targetStatus={contextMenu.targetStatus}/>}
        <Route path={`${match.url}/config`}>
          <Modal id={Date.now()} smallModal content={
            <ConfigChatRoom 
              chatRoomInfo={chatRoomInfo}
              channelIdToBeSet={`${chatRoomInfo.channel_id}`}
              setIsMadeMyself={setIsMadeMyself}
              setChatRoomInfo={setChatRoomInfo}
              socket={socket}/>
            } />
        </Route>
        <Route path={`${match.url}/invite`}>
          <Modal
            id={Date.now()}
            smallModal
            content={<ChatInviteContent
                        chatTitle={chatRoomInfo.title}
                        channelId={chatRoomInfo.channel_id} 
                        chatUsers={chatUsers}/>}/>
        </Route>
        <Route path={`${match.url}/profile/:nick`}>
          <Modal id={Date.now()} smallModal content={<ProfileContent readonly/>}/>
        </Route>
        <Route path={`${match.url}/game`}>
          <Modal id={Date.now()} content={<GameContent/>} />
        </Route>
        <Route path={`${match.path}/spectate`}>
          <Modal id={Date.now()} content={<GameSpectateContent />} />
        </Route>
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