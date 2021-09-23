import { FC, Dispatch, SetStateAction, useEffect, useState, useCallback } from "react";
import "/src/scss/content/chat/ChatContent.scss";
import EasyFetch from "../../../../utils/EasyFetch";
import ChatRoomContent from "./ChatRoomContent";
import { Link, Route } from "react-router-dom";
import Modal from "../../Modal";
import MakeChatRoom from "./MakeChatRoom";

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
      <li className="chat-generator-li" key={idx} onClick={() => setChatRoomInfo({...chatRoom})}>
        <span className="chat-generator-span">{chatRoom.title}{chatRoom.type === "protected" ? <img className="chat-generator-lock-img" src="/public/lock.svg" alt="비밀방" /> : <></>}</span>
        <span className="chat-generator-span">{chatRoom.current_people}/{chatRoom.max_people}</span>
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
      const easyfetch = new EasyFetch(`${global.BE_HOST}/chat`);
      res = await (await easyfetch.fetch()).json();
    } else {
      const easyfetch = new EasyFetch(`${global.BE_HOST}/chat/title?title=${search}`);
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
          className="chat-search-input"
          type="text"
          placeholder="검색하려는 채팅방 이름을 입력해 주세요"
          value={searchInputValue}
          spellCheck={false}
          onChange={({target: {value}}) => setSearchInputValue(value)} 
          onKeyDown={(e) => {if (e.key === "Enter") setChatRoomToFind(searchInputValue)}} /><span className="input-border" />
        <button className="chat-search-button" onClick={() => setChatRoomToFind(searchInputValue)}><img className="chat-search-img" src="/public/search.svg" alt="검색"/></button>
      </div>
      <ul id="chat-room-selector">
        <li className="chat-room-li" onClick={() => setChatRoomSelector("all")}>
            <input className="chat-room-input" type="radio" name="all" checked={chatRoomSelector === "all"} onChange={() => {}}/>
            <label className="chat-room-label">전체</label>
        </li>
        <li className="chat-room-li" onClick={() => setChatRoomSelector("public")}>
            <input className="chat-room-input" type="radio" name="public" checked={chatRoomSelector === "public"} onChange={() => {}}/>
            <label className="chat-room-label">공개방</label>
        </li>
        <li className="chat-room-li" onClick={() => setChatRoomSelector("protected")}>
            <input className="chat-room-input" type="radio" name="protected" checked={chatRoomSelector === "protected"} onChange={() => {}}/>
            <label className="chat-room-label">비밀방</label>
        </li>
      </ul>
      <ChatRoomList search={chatRoomToFind} type={chatRoomSelector} setChatRoomInfo={setChatRoomInfo}/>
      <Link to={`/mainpage/chat/makechat`}>
        <button className="chat-room-btn">채팅방 만들기</button>
      </Link>
      <Route path={`/mainpage/chat/makechat`}><Modal id={Date.now()} content={<MakeChatRoom />} smallModal/></Route>
    </div>
  );
}

/*!
 * @author yochoi
 * @brief 상황에 따라 content를 보여주는 컴포넌트
 */

const ChatContent: FC = (props): JSX.Element => {

  const [chatRoomInfo, setChatRoomInfo] = useState<chatRoom>({title: "", type: "", max_people: 0, current_people: 0});

  return (
    <>
      {chatRoomInfo.title === "" ? <ChatMain setChatRoomInfo={setChatRoomInfo}/> : <ChatRoomContent chatRoomInfo={chatRoomInfo} setChatRoomInfo={setChatRoomInfo}/>}
    </>
  );
}

export default ChatContent;