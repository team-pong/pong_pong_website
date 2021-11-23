import { FC, useEffect, useRef, useState } from "react";
import "/src/scss/content/chat/ChatContent.scss";
import EasyFetch from "../../../../utils/EasyFetch";
import ChatRoomContent from "./ChatRoomContent";
import { Link, Route, useLocation } from "react-router-dom";
import Modal from "../../Modal";
import ConfigChatRoom from "./ConfigChatRoom";
import Loading from "../../../loading/Loading";
import NoResult from "../../../noresult/NoResult";

interface ChatRoom {
  channel_id: number,
  title: string,
  type: string,
  current_people: number,
  max_people: number
};

interface ChatRoomListProps {
  search: string,
  type: string,
};

const ChatRoomList: FC<ChatRoomListProps> = ({ search, type }): JSX.Element => {

  const [publicChatRoom, setPublicChatRoom] = useState<ChatRoom[]>([]);
  const [protectedChatRoom, setProtectedChatRoom] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const mounted = useRef(false);

  /*!
   * @author donglee, yochoi
   * @brief map 함수 안에서 대화방 목록 정보를 li에 담아서 return 하는 함수
   * @detail 대화방에 들어갔다가 나올 때 웹소켓 연결을 끊으면서 백엔드에서 대화방에서 사용자가 나간
   *         경우를 API 요청하는데 이 요청보다 현재 FC가 get하는 요청이 더 빠른 경우에
   *         chatRoom의 정보가 정확하지 않아서 에러가 나는 경우가 있는데 이를 if 문으로 예외처리함.
   */  
  const chatRoomListGenerator = (chatRoom: ChatRoom, idx: number) => {
    if (chatRoom.current_people === 0 || chatRoom.current_people.constructor == Object) {
      return ;
    }
    return (
      <Link
        to={`/mainpage/chat/${chatRoom.channel_id}`}
        key={idx}
        style={{color: "inherit", textDecoration: "none"}}>
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
  const sortChatRoomList = (list: ChatRoom[]) => {
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
    if (mounted.current) {
      setPublicChatRoom(sortedPublicList);
      setProtectedChatRoom(sortedProtectedList);
    }
  }

  const getChatRoomList = async (): Promise<ChatRoom[]> => {
    let res: {chatList: ChatRoom[]};

    if (search === "") {
      const easyfetch = new EasyFetch(`${global.BE_HOST}/chat`);
      res = await easyfetch.fetch();
    } else {
      const easyfetch = new EasyFetch(`${global.BE_HOST}/chat/title?title=${search}`);
      res = await easyfetch.fetch();
    }
    return (res.chatList);
  }

  useEffect(() => {
    mounted.current = true;
    return (() => {mounted.current = false});
  }, []);

  useEffect(() => {
    getChatRoomList()
    .then(sortChatRoomList)
    .then(() => {if (mounted.current) setIsLoading(false)});
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
  const [isMadeMyself, setIsMadeMyself] = useState(false);

  if (window.location.pathname === "/mainpage/chat"
      || window.location.pathname === "/mainpage/chat/makechat") {
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
        <ChatRoomList search={chatRoomToFind} type={chatRoomSelector} />
        <Link to={`/mainpage/chat/makechat`}>
          <button className="chat-room-btn">채팅방 만들기</button>
        </Link>
        <Route path={`/mainpage/chat/makechat`}>
          <Modal id={Date.now()} content={<ConfigChatRoom setIsMadeMyself={setIsMadeMyself}/>} smallModal/>
        </Route>
      </div>
    );
  } else {
    return <Route path="/mainpage/chat/:channel_id"><ChatRoomContent isMadeMyself={isMadeMyself} setIsMadeMyself={setIsMadeMyself}/></Route>;
  }
}

export default ChatContent;