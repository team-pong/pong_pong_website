import { FC, useEffect, useState } from "react";
import "../../../scss/content/ChatContent.scss";
import EasyFetch from "../../../utils/EasyFetch";

interface chatRoom {
  title: string,
  type: string,
  current_people: number,
  max_people: number
};

const ChatRoomList: FC<{target: string}> = ({target}): JSX.Element => {

  const [publicChatRoom, setPublicChatRoom] = useState<chatRoom[]>([]);
  const [protectedChatRoom, setProtectedChatRoom] = useState<chatRoom[]>([]);

  const chatRoomListGenerator = (chatRoom: chatRoom, idx: number) => {
    return (
      <li key={idx}>
        <span>{chatRoom.title}{chatRoom.type === "protected" ? <img src="./public/lock.svg" alt="비밀방" /> : <></>}</span>
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
    const easyfetch = new EasyFetch('http://127.0.0.1:3001/chat');
    const {chatList}: {chatList: chatRoom[]} = await (await easyfetch.fetch()).json();
    return (chatList);
  }

  useEffect(() => {
    getChatRoomList()
    .then(sortChatRoomList);
  }, []);

  return (
    <ul id="chat-room-list">
      {target === "all" ? [...publicChatRoom, ...protectedChatRoom].map(chatRoomListGenerator) : <></>}
      {target === "public" ? publicChatRoom.map(chatRoomListGenerator) : <></>}
      {target === "protected" ? protectedChatRoom.map(chatRoomListGenerator) : <></>}
    </ul>
  );
}

/*!
 * @author yochoi
 * @brief 검색, 전적을 보여주는 컴포넌트
 */

const ChatContent: FC = (): JSX.Element => {

  const [chatRoomToFind, setChatRoomToFind] = useState("");
  const [chatRoomSelector, setChatRoomSelector] = useState("all");

  return (
    <div id="chat-content">
      <div id="search">
        <input
          type="text"
          placeholder="검색하려는 채팅방 이름을 입력해 주세요"
          value={chatRoomToFind}
          spellCheck={false}
          onChange={({target: {value}}) => setChatRoomToFind(value)} 
          onKeyDown={(e) => {if (e.key === "Enter") null}} />
        <button onClick={null}><img src="./public/search.svg" alt="검색"/></button>
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
      <ChatRoomList target={chatRoomSelector}/>
    </div>
  );
}

export default ChatContent;