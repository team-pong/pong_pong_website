import { FC, Dispatch, SetStateAction, useState } from "react";
import { Link, Route } from "react-router-dom";
import Modal from "../../Modal";
import ChatConfigContent from "./ChatConfigContent";
import ChatInviteContent from "./ChatInviteContent";
import ChatContextMenu from "./ChatContextMenu";

interface chatRoom {
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

function controllTextAreaKeyDown(e: React.KeyboardEvent,
                          message: string, setMessage: Dispatch<SetStateAction<string>>,
                          chatLog, setChatLog: Dispatch<SetStateAction<any>>) {
  const keyCode = e.key;

  if (keyCode === "Enter" && !e.shiftKey) {
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

const ChatRoomContent: FC<{chatRoomInfo: chatRoom, setChatRoomInfo: Dispatch<SetStateAction<chatRoom>>}> = ({chatRoomInfo, setChatRoomInfo}): JSX.Element => {

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

  return (
    <div id="chat-room">
      <div id="chat-room-header">
        <img src="/public/arrow.svg" id="arrow-button" alt="뒤로가기" onClick={() => setChatRoomInfo({title: "", type: "", max_people: 0, current_people: 0})}/>
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
                <img src={value.avatar_url} alt={value.nick} />
                <span>{value.nick}</span>
                {value.position === "owner" && <img id="position" src={"/public/crown.png"} alt="owner"/>}
                {value.position === "admin" && <img id="position" src={"/public/knight.png"} alt="admin"/>}
                {value.position === "mute" && <img id="position" src={"/public/mute.png"} alt="mute"/>}
              </div>
            );
          })
        }
        <div id="chat-room-menu">
          <Link to="/mainpage/chat/invite"><img src="/public/plus.svg" alt="invite" /></Link>
          <Link to="/mainpage/chat/config"><img src="/public/tools.svg" alt="config" /></Link>
        </div>
      </div>
      <form>
        <textarea
          placeholder="대화내용 입력"
          rows={4}
          cols={50}
          value={message}
          onKeyDown={(e) => controllTextAreaKeyDown(e, message, setMessage, chatLog, setChatLog)}
          onChange={({target: {value}}) => setMessage(value)}/>
        <button onClick={() => submitMessage(message, setMessage, chatLog, setChatLog)}>전송</button>
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