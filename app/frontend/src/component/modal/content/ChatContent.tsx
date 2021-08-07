import { FC, useEffect, useState } from "react";
import "../../../scss/content/ChatContent.scss";
import EasyFetch from "../../../utils/EasyFetch";


/*!
 * @author yochoi
 * @brief 검색, 전적을 보여주는 컴포넌트
 */

const ChatContent: FC = (): JSX.Element => {

  const [chatRoomToFind, setChatRoomToFind] = useState("");

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
    </div>
  );
}

export default ChatContent;