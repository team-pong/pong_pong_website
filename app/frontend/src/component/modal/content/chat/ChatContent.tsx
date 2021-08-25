import React, { FC, Dispatch, SetStateAction, useEffect, useState } from "react";
import "/src/scss/content/ChatContent.scss";
import EasyFetch from "../../../../utils/EasyFetch";
import { Route, Link } from "react-router-dom";
import Modal from "../../Modal";
import ChatConfigContent from "./ChatConfigContent";
import ChatContextMenu from "./ChatContextMenu";

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

function textAreaKeyDown(e: React.KeyboardEvent,
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
  setContextMenu({
    isOpen: true,
    x: e.pageX,
    y: e.pageY,
    target,
    targetPosition
  });
};

const ChatRoom: FC<{chatRoomInfo: chatRoom, setChatRoomInfo: Dispatch<SetStateAction<chatRoom>>}> = ({chatRoomInfo, setChatRoomInfo}): JSX.Element => {

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
                    onClick={(e) => {
                      if (contextMenu.isOpen === true) setContextMenu({isOpen: false, x: 0, y: 0, target: "", targetPosition: ""})
                      else openContextMenu(e, setContextMenu, value.nick, value.position)
                    }}>
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
          <img src="/public/plus.svg" alt="invite" />
          <Link to="/mainpage/chat/config"><img src="/public/tools.svg" alt="config" /></Link>
        </div>
      </div>
      <form>
        <textarea
          placeholder="대화내용 입력"
          rows={4}
          cols={50}
          value={message}
          onKeyDown={(e) => textAreaKeyDown(e, message, setMessage, chatLog, setChatLog)}
          onChange={({target: {value}}) => setMessage(value)}/>
        <button onClick={() => submitMessage(message, setMessage, chatLog, setChatLog)}>전송</button>
      </form>
      {contextMenu.isOpen && <ChatContextMenu x={contextMenu.x} y={contextMenu.y} myPosition="owner" targetPosition={contextMenu.targetPosition}/>}
      <Route path="/mainpage/chat/config"><Modal id={Date.now()} smallModal content={<ChatConfigContent/>}/></Route>
    </div>
  );
};

interface chatRoom {
  title: string,
  type: string,
  current_people: number,
  max_people: number
};

interface chatRoomListProps {
  search: string,
  type: string,
  setChatRoomInfo: Dispatch<SetStateAction<chatRoom>>
};

const ChatRoomList: FC<chatRoomListProps> = ({search, type, setChatRoomInfo}): JSX.Element => {

  const [publicChatRoom, setPublicChatRoom] = useState<chatRoom[]>([]);
  const [protectedChatRoom, setProtectedChatRoom] = useState<chatRoom[]>([]);

  const chatRoomListGenerator = (chatRoom: chatRoom, idx: number) => {
    return (
      <li key={idx} onClick={() => setChatRoomInfo({...chatRoom})}>
        <span>{chatRoom.title}{chatRoom.type === "protected" ? <img src="/public/lock.svg" alt="비밀방" /> : <></>}</span>
        <span>{chatRoom.current_people}/{chatRoom.max_people}</span>
      </li>
    );
  }

  const sortChatRoomList = (list: chatRoom[]) => {
    list.map(chatRoom => {
      switch (chatRoom.type) {
        case "public":
          setPublicChatRoom(publicChatRoom => [...publicChatRoom, chatRoom]);
          break ;
        case "protected":
          setProtectedChatRoom(protectedChatRoom => [...protectedChatRoom, chatRoom]);
          break ;
        default:
          break ;
      }
    });
  }

  const getChatRoomList = async (): Promise<chatRoom[]> => {
    let res: {chatList: chatRoom[]};
    setPublicChatRoom([]);
    setProtectedChatRoom([]);
    if (search === "") {
      const easyfetch = new EasyFetch('http://127.0.0.1:3001/chat');
      res = await (await easyfetch.fetch()).json();
    } else {
      const easyfetch = new EasyFetch(`http://127.0.0.1:3001/chat/title?title=${search}`);
      res = await (await easyfetch.fetch()).json();
    }
    return (res.chatList);
  }

  useEffect(() => {
    getChatRoomList()
    .then(sortChatRoomList);
  }, [search]);

  return (
    <ul id="chat-room-list">
      {type === "all" ? [...publicChatRoom, ...protectedChatRoom].map(chatRoomListGenerator) : <></>}
      {type === "public" ? publicChatRoom.map(chatRoomListGenerator) : <></>}
      {type === "protected" ? protectedChatRoom.map(chatRoomListGenerator) : <></>}
    </ul>
  );
}

/*!
 * @author yochoi
 * @brief 검색, 전적을 보여주는 컴포넌트
 */

const ChatMain: FC<{setChatRoomInfo: Dispatch<SetStateAction<chatRoom>>}> = ({setChatRoomInfo}): JSX.Element => {

  const [searchInputValue, setSearchInputValue] = useState("");
  const [chatRoomToFind, setChatRoomToFind] = useState("");
  const [chatRoomSelector, setChatRoomSelector] = useState("all");

  return (
    <div id="chat-main">
      <div id="search">
        <input
          type="text"
          placeholder="검색하려는 채팅방 이름을 입력해 주세요"
          value={searchInputValue}
          spellCheck={false}
          onChange={({target: {value}}) => setSearchInputValue(value)} 
          onKeyDown={(e) => {if (e.key === "Enter") setChatRoomToFind(searchInputValue)}} /><span className="input-border" />
        <button onClick={() => setChatRoomToFind(searchInputValue)}><img src="/public/search.svg" alt="검색"/></button>
      </div>
      <ul id="chat-room-selector">
        <li onClick={() => setChatRoomSelector("all")}>
            <input type="radio" name="all" checked={chatRoomSelector === "all"} onChange={() => {}}/>
            <label>전체</label>
        </li>
        <li onClick={() => setChatRoomSelector("public")}>
            <input type="radio" name="public" checked={chatRoomSelector === "public"} onChange={() => {}}/>
            <label>공개방</label>
        </li>
        <li onClick={() => setChatRoomSelector("protected")}>
            <input type="radio" name="protected" checked={chatRoomSelector === "protected"} onChange={() => {}}/>
            <label>비밀방</label>
        </li>
      </ul>
      <ChatRoomList search={chatRoomToFind} type={chatRoomSelector} setChatRoomInfo={setChatRoomInfo}/>
      <button>채팅방 만들기</button>
    </div>
  );
}

/*!
 * @author yochoi
 * @brief 상황에 따라 content를 보여주는 컴포넌트
 */

const ChatContent: FC = (): JSX.Element => {

  const [chatRoomInfo, setChatRoomInfo] = useState<chatRoom>({title: "", type: "", max_people: 0, current_people: 0});

  return (
    <>
      {chatRoomInfo.title === "" ? <ChatMain setChatRoomInfo={setChatRoomInfo}/> : <ChatRoom chatRoomInfo={chatRoomInfo} setChatRoomInfo={setChatRoomInfo}/>}
    </>
  );
}

export default ChatContent;