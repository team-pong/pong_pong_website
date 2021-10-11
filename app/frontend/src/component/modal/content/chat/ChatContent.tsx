import { FC, useEffect, useState } from "react";
import "/src/scss/content/chat/ChatContent.scss";
import EasyFetch from "../../../../utils/EasyFetch";
import ChatRoomContent from "./ChatRoomContent";
import { Link, Route } from "react-router-dom";
import Modal from "../../Modal";
import MakeChatRoom from "./MakeChatRoom";
import Loading from "../../../loading/Loading";
import NoResult from "../../../noresult/NoResult";

interface chatRoom {
  channel_id: number,
  title: string,
  type: string,
  current_people: number,
  max_people: number
};

interface chatRoomListProps {
  search: string,
  type: string,
  roomToBeRemoved: number,
};

const ChatRoomList: FC<chatRoomListProps> = ({ search, type, roomToBeRemoved }): JSX.Element => {

  const [publicChatRoom, setPublicChatRoom] = useState<chatRoom[]>([]);
  const [protectedChatRoom, setProtectedChatRoom] = useState<chatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const chatRoomListGenerator = (chatRoom: chatRoom, idx: number) => {
    return (
      <Link to={`/mainpage/chat/${chatRoom.channel_id}`} key={idx} style={{color: "inherit", textDecoration: "none"}}>
        <li className="chat-generator-li">
          <span className="chat-generator-span">{chatRoom.title}{chatRoom.type === "protected" ? <img className="chat-generator-lock-img" src="/public/lock.svg" alt="비밀방" /> : <></>}</span>
          <span className="chat-generator-span">{chatRoom.current_people}/{chatRoom.max_people}</span>
        </li>
      </Link>
    );
  }

  /*!
   * @author donglee
   * @brief public과 protected로 각각 state에 저장함
   */
  const sortChatRoomList = (list: chatRoom[]) => {
    let sortedPublicList = [];
    let sortedProtectedList = [];

    list.forEach((chatRoom) => {
      switch (chatRoom.type) {
        case "public":
          sortedPublicList.push(chatRoom);
          break ;
        case "protected":
          sortedProtectedList.push(chatRoom);
          break ;
        default:
          break ;
      }
    });
    setPublicChatRoom(sortedPublicList);
    setProtectedChatRoom(sortedProtectedList);
  }

  const getChatRoomList = async (): Promise<chatRoom[]> => {
    let res: {chatList: chatRoom[]};

    if (search === "") {
      const easyfetch = new EasyFetch(`${global.BE_HOST}/chat`);
      res = await easyfetch.fetch();
    } else {
      const easyfetch = new EasyFetch(`${global.BE_HOST}/chat/title?title=${search}`);
      res = await easyfetch.fetch();
    }
    return (res.chatList);
  }

  const checkRoomEmpty = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/chat/oneChat?channel_id=${roomToBeRemoved}`);
    const res = await easyfetch.fetch();

    console.log("res: ", res);
  };

  /* TroubleShooting: roomToBeRemoved가 하위 컴포넌트에서 바뀌면 다시 렌더링을 하고
  그렇게 다시 렌더링이 ChatContent까지는 잘 되는거 같은데 왜 ChatList까지는 렌더링을 다시
  하지 않는거지? 이 부분을 해결해보자 */

  useEffect(() => {
    getChatRoomList()
    .then(sortChatRoomList)
    .then(() => setIsLoading(false));
  }, [search]);

  if (isLoading) {
    return (
      <Loading color="gray" style={{width: "100px", height: "100px", position: "absolute", left: "35%", top: "25%"}}/>
    )
  } else {
    return (
      <ul id="chat-room-list">
        {type === "all"
          ? ([...publicChatRoom, ...protectedChatRoom].map(chatRoomListGenerator).length === 0
            ? <NoResult style={{display: "block", marginTop: "20px"}}/>
            : [...publicChatRoom, ...protectedChatRoom].map(chatRoomListGenerator))
          : <></>}
        {type === "public"
          ? (publicChatRoom.map(chatRoomListGenerator).length === 0
            ? <NoResult style={{display: "block", marginTop: "20px"}}/>
            : publicChatRoom.map(chatRoomListGenerator))
          : <></>}
        {type === "protected"
          ? (protectedChatRoom.map(chatRoomListGenerator).length === 0
            ? <NoResult style={{display: "block", marginTop: "20px"}}/>
            : protectedChatRoom.map(chatRoomListGenerator))
          : <></>}
      </ul>
    );
  }
}

/*!
 * @author yochoi, donglee
 * @brief 대화방 리스트를 보여주거나 대화방 클릭시 대화방 내부를 보여주는 FC
 * @detail 현재 페이지의 pathname을 기준으로 대화방 channel_id가
 *         pathname에 없으면 리스트를, 있으면 대화방 내부를 렌더링함
 */

const ChatContent: FC = (): JSX.Element => {

  const [searchInputValue, setSearchInputValue] = useState("");
  const [chatRoomToFind, setChatRoomToFind] = useState("");
  const [chatRoomSelector, setChatRoomSelector] = useState("all");
  const [roomToBeRemoved, setRoomToBeRemoved] = useState(0);

  if (window.location.pathname === "/mainpage/chat"
      || window.location.pathname === "/mainpage/chat/makechat") {
    return (
      <div id="chat-main">
        {console.log("test: ", roomToBeRemoved)}
        <div id="search">
          <input
            className="chat-search-input"
            type="text"
            placeholder="검색하려는 채팅방 이름을 입력해 주세요"
            value={searchInputValue}
            spellCheck={false}
            onChange={({target: {value}}) => setSearchInputValue(value)} 
            onKeyDown={(e) => {if (e.key === "Enter") setChatRoomToFind(searchInputValue)}} /><span className="input-border" />
          <button className="chat-search-button" onClick={() => setChatRoomToFind(searchInputValue)}>
            <img className="chat-search-img" src="/public/search.svg" alt="검색"/>
          </button>
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
            <label className="chat-room-label">비공개방</label>
          </li>
        </ul>
        <ChatRoomList search={chatRoomToFind} type={chatRoomSelector} roomToBeRemoved={roomToBeRemoved}/>
        <Link to={`/mainpage/chat/makechat`}>
          <button className="chat-room-btn">채팅방 만들기</button>
        </Link>
        <Route path={`/mainpage/chat/makechat`}>
          <Modal id={Date.now()} content={<MakeChatRoom />} smallModal/>
        </Route>
      </div>
    );
  } else {
    return (
      <Route path="/mainpage/chat/:channel_id"><ChatRoomContent setRoomToBeRemoved={setRoomToBeRemoved}/></Route>
    );
  }
}

export default ChatContent;