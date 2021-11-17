import {Dispatch, FC, SetStateAction, useContext, useEffect, useRef, useState} from "react";
import "/src/scss/content/chat/ConfigChatRoom.scss";
import EasyFetch from "../../../../utils/EasyFetch";
import { Redirect } from "react-router-dom";
import { ChatRoom } from "./ChatRoomContent";
import { Socket } from "socket.io-client";
import { SetNoticeInfoContext } from "../../../../Context";
import { NOTICE_RED } from "../../../mainpage/navbar/addFriend/AddFriend";

interface ConfigChatRoomProps {
  chatRoomInfo?: ChatRoom;
  setChatRoomInfo?: Dispatch<SetStateAction<ChatRoom>>;
  channelIdToBeSet?: string;
  socket?: Socket;
  setIsMadeMyself: Dispatch<SetStateAction<boolean>>;
};

/*!
 * @author donglee
 * @brief 채팅방을 설정하여 만드는 컴포넌트
 * @param[in] chatRoomInfo?: 대화방 만들기가 아닌 대화방 설정 변경 시에만 방 정보가 넘어옴
 * @param[in] setChatRoomInfo?: 설정을 변경한 후에 ChatRoomContent에 보여질 state를 업데이트하기 위함
 * @param[in] channelIdToBeSet?: 설정변경할 채널의 아이디를 ChatRoomContent에서 받아옴
 * @param[in] socket?: 대화방 설정 변경 시에 다른 클라이언트에게 data보내기 위함
 * @param[in] setIsMadeMyself: 방을 직접 만드는 경우에만 true값으로 이 FC에서 바꿔줌
 */
const ConfigChatRoom: FC<ConfigChatRoomProps> = (
    {chatRoomInfo, channelIdToBeSet, setIsMadeMyself, setChatRoomInfo, socket}
  ): JSX.Element => {

  const [title, setTitle] = useState(chatRoomInfo ? chatRoomInfo.title : "");
  const [type, setType] = useState(chatRoomInfo ? chatRoomInfo.type : "public");
  const [password, setPassword] = useState("");
  const [max, setMax] = useState(chatRoomInfo ? chatRoomInfo.max_people : 2);
  const [channelId, setChannelId] = useState("");

  const setNoticeInfo = useContext(SetNoticeInfoContext);

  const mounted = useRef(false);

  /*!
   * @author donglee
   * @brief 대화방 이름과 비밀번호의 글자수가 유효한지 검사
   */
  const checkFormat = () => {
    if (title.length < 2) {
      setNoticeInfo({
        isOpen: true,
        seconds: 3,
        content: "대화방 이름은 두 자 이상이어야 합니다.",
        backgroundColor: NOTICE_RED,
      });
      return false;
    }
    if (type === "protected" && password.length < 4) {
      setNoticeInfo({
        isOpen: true,
        seconds: 3,
        content: "비밀번호는 4자 이상이어야 합니다.",
        backgroundColor: NOTICE_RED,
      });
      return false;
    }
    return true;
  }

  /*!
   * @author donglee
   * @brief - 채팅방 만들기 요청 후 해당 채팅방으로 redirect함
   *        - 성공적으로 만들어졌으면 내가 직접 만든 방이라는 isMadeMyself 를 true로 바꿔줌(password없이 입장하기 위함)
   *        - protected일 때만 isMadeMyself 를 true로 해줘야 두 번 연결하지 않음
   */
  const makeChatRoom = async () => {
    if (checkFormat()) {
      const easyfetch = new EasyFetch(`${global.BE_HOST}/chat`, "POST");
      const body = {
        "title": title,
        "type": type,
        "passwd": password,
        "max_people": max,
      };
      const res = await easyfetch.fetch(body);
      if (!res.err_msg) {
        setChannelId(res.chatRoom.channel_id);
        if (type === "protected") setIsMadeMyself(true);
      } else {
        setNoticeInfo({
          isOpen: true,
          seconds: 3,
          content: res.err_msg,
          backgroundColor: NOTICE_RED,
        });
      }
    }
  };

  /*!
   * @author donglee
   * @brief 채팅방 설정 변경 요청 후 해당 채팅방으로 다시 뒤로가기함
   */
  const editChatRoom = async () => {
    if (checkFormat()) {
      const easyfetch = new EasyFetch(`${global.BE_HOST}/chat/channel`, "POST");

      const body = {
        "channel_id": +channelIdToBeSet,
        "title": title,
        "type": type,
        "passwd": password,
        "max_people": max,
      };
      const res = await easyfetch.fetch(body);

      if (res.err_msg === "에러가 없습니다.") {
        const newRoomInfo = {
          title: title,
          type: type,
          current_people: chatRoomInfo.current_people,
          max_people: max,
          passwd: password,
          channel_id: +channelIdToBeSet,
        };
        setChatRoomInfo(newRoomInfo);
        socket.emit("setRoomInfo", newRoomInfo);
        if (mounted.current) setChannelId(channelIdToBeSet);
      } else {
        setNoticeInfo({
          isOpen: true,
          seconds: 3,
          content: res.err_msg,
          backgroundColor: NOTICE_RED,
        });
      }
    }
  };

  useEffect(() => {
    mounted.current = true;
    return (() => {mounted.current = false});
  }, []);

  if (channelId) {
    return <Redirect to={`/mainpage/chat/${channelId}`} />
  } else {
    return (
      <div className="mc-container">
        <h2>{chatRoomInfo ? "대화방 설정 변경" : "채팅방 만들기"}</h2>
        <div className="mc-content-container">
          <label htmlFor="mc-title">채팅방 이름:</label>
          <form onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              id="mc-title"
              placeholder="대화방 이름을 입력하세요."
              required
              minLength={2}
              maxLength={15}
              value={title}
              autoComplete="off"
              onChange={(e) => setTitle(e.target.value)}/>
          </form>
        </div>
        <div className="mc-content-container">
          <label>공개 범위:</label>
          <div className="mc-type-container">
            <input
              className="mc-type"
              type="radio"
              id="mc-public"
              value="public"
              checked={type === "public"}
              onChange={() => {}} />
            <label
              className="mc-type-label"
              htmlFor="mc-public"
              onClick={() => setType("public")}>공개방</label>
            <input
              className="mc-type"
              type="radio"
              id="mc-protected"
              value="protected"
              checked={type === "protected"}
              onChange={() => {}} />
            <label
              className="mc-type-label"
              htmlFor="mc-protected"
              onClick={() => setType("protected")}>비공개방</label>
            <input
              className="mc-type"
              type="radio"
              id="mc-private"
              value="private"
              checked={type === "private"}
              onChange={() => {}} />        
            <label
              className="mc-type-label"
              htmlFor="mc-private"
              onClick={() => setType("private")}>비밀방</label>
          </div>
          <span className={"mc-explain" + (type === "public" ? " mc-explain-selected" : "")}>
            공개방은 모든 사람들에게 공개되고 누구나 제한없이 입장할 수 있습니다
          </span>
          <span className={"mc-explain" + (type === "protected" ? " mc-explain-selected" : "")}>
            비공개방은 모든 사람들이 목록에서 볼 수는 있지만 비밀번호를 아는 사용자만 입장할 수 있습니다
          </span>
          <span className={"mc-explain" + (type === "private" ? " mc-explain-selected" : "")}>
            비밀방은 어떤 목록에서도 보이지 않고 초대하고 싶은 사람들만 초대해서 대화를 할 수 있습니다
          </span>
        </div>
        <div className={"mc-password-container" + (type === "protected" ? " mc-password-selected" : "") }>
          <label htmlFor="mc-password">비밀번호:</label>
          <form onSubmit={(e) => e.preventDefault()}>
            <input
              id="mc-password"
              type="password"
              required
              minLength={4}
              maxLength={10}
              placeholder="비밀번호를 입력하세요."
              size={10}
              value={password}
              onChange={(e) => setPassword(e.target.value)}/>
          </form>
        </div>
        <div className="mc-content-container">
          <label htmlFor="mc-max">최대 인원:</label>
          <select name="mc-max" id="mc-max" required value={max} onChange={(e) => setMax(+e.target.value)}>
            <option className="mc-option" value={2}>2명</option>
            <option className="mc-option" value={4}>4명</option>
            <option className="mc-option" value={6}>6명</option>
            <option className="mc-option" value={8}>8명</option>
            <option className="mc-option" value={10}>10명</option>
          </select>
        </div>
        <button className="mc-make" onClick={chatRoomInfo ? editChatRoom : makeChatRoom}>
          {chatRoomInfo ? "변경하기" : "만들기"}
        </button>
      </div>
    );
  }
};

export default ConfigChatRoom;