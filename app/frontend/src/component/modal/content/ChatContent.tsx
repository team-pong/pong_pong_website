import { FC, Dispatch, SetStateAction, useEffect, useState } from "react";
import "../../../scss/content/ChatContent.scss";
import EasyFetch from "../../../utils/EasyFetch";

const ChatRoom: FC<{chatRoomInfo: chatRoom, setChatRoomInfo: Dispatch<SetStateAction<chatRoom>>}> = ({chatRoomInfo, setChatRoomInfo}): JSX.Element => {

  const [chatUsers, setChatUsers] = useState<{nick: string, avatar_url: string, position: string}[]>(require("../../../dummydata/testChatRoomLog").chatUsers);
  const [chatLog, setChatLog] = useState(require("../../../dummydata/testChatRoomLog").chatLog);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setMessage("");
  }, [chatLog]);

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
              <div key={idx} className="chat-user">
                <img src={value.avatar_url} alt={value.nick}/>
                <span>{value.nick}</span>
              </div>
            );
          })
        }
        <div id="chat-room-menu">
          <img src="/public/plus.svg" alt="invite" />
          <img src="/public/tools.svg" alt="config" />
        </div>
      </div>
      <form>
        <textarea placeholder="대화내용 입력" rows={4} cols={50} value={message} onChange={({target: {value}}) => setMessage(value)}/>
        <button onClick={() => setChatLog([{
            nick: "yochoi",
            position: "admin",
            avatar_url: `https://cdn.intra.42.fr/users/medium_donglee.jpg`,
            time: new Date().getTime(),
            message: message
          }, ...chatLog])}>전송</button>
      </form>
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