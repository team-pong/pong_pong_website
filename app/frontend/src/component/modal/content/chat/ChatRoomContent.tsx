import { FC, Dispatch, SetStateAction, useState, useEffect } from "react";
import { Link, Route, useParams } from "react-router-dom";
import Modal from "../../Modal";
import ChatConfigContent from "./ChatConfigContent";
import ChatInviteContent from "./ChatInviteContent";
import ChatContextMenu from "./ChatContextMenu";

interface ChatRoom {
  title: string,
  type: string,
  current_people: number,
  max_people: number
};

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

const ChatRoomContent: FC = (): JSX.Element => {

  const [chatUsers, setChatUsers] = useState<{nick: string, avatar_url: string, position: string}[]>(require("../../../../dummydata/testChatRoomLog").chatUsers);
  const [chatLog, setChatLog] = useState(require("../../../../dummydata/testChatRoomLog").chatLog);
  const [message, setMessage] = useState("");
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean,
    x: number,
    y: number,
    target: string,
    targetPosition: string
  }>({isOpen: false, x: 0, y: 0, target: "", targetPosition: ""});

  /* TODO: 현재는 test용 dummy 데이터임.
           백엔드 업데이트 이후 channel_id로 정보를 받아와야 함 */
  const [chatRoomInfo, setChatRoomInfo] = useState<ChatRoom>({
    title: "hello",
    type: "public",
    current_people: 4,
    max_people: 4,
  });
  const { channel_id } = useParams<{channel_id: string}>();

  useEffect(() => {
    /* TODO: channel_id 로 채팅방을 검색한 후에 없으면 없는 방이라고 보여줘야 함 */
  }, []);

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
                  <span id="message-nick"><b>{value.nick}</b> {hour}:{minute}</span>
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
};

export default ChatRoomContent;