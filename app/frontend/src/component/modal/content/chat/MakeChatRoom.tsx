import { FC, useEffect, useState } from "react";
import "/src/scss/content/chat/MakeChatRoom.scss";
import EasyFetch from "../../../../utils/EasyFetch";

const MakeChatRoom: FC = (props): JSX.Element => {

  // const makeChatRoom = (e) => {
  //   e.preventDefault();
  //   console.log("cubsuimt1");
  // };

  // const test = async () => {
  //   const easyfetch = new EasyFetch(`${global.BE_HOST}/chat`, "POST");
  //   const body = {
  //     "title": "아무나 와보던가",
  //     "type": "public",
  //     "passwd": "",
  //     "max_people": 10
  //   };
  //   const res = await (await easyfetch.fetch(body)).json();

  //   console.log("res: ", res);
  // };

  const [title, setTitle] = useState("");
  const [type, setType] = useState("public");

  // useEffect(() => {
  //   test();
  // }, []);

  const makeChatRoom = () => {
    console.log("Submmit");
  };

  const selectType = (e) => {
    setType(e.target.value);
  }

  return (
    <div className="mc-container">
      <h2>채팅방 만들기</h2>
      <div className="mc-content-container">
        <label htmlFor="mc-title">채팅방 이름:</label>
        <input type="text" id="mc-title"/>
      </div>
      <div className="mc-content-container">
        <label>공개 범위:</label>
        <div className="mc-type-container">
          <input className="mc-type" type="radio" id="mc-public" value="public" checked={type === "public"} onChange={() => {}} />
          <label className="mc-type-label" htmlFor="mc-public" onClick={() => setType("public")}>공개방</label>
          <input className="mc-type" type="radio" id="mc-protected" value="protected" checked={type === "protected"} onChange={() => {}} />
          <label className="mc-type-label" htmlFor="mc-protected" onClick={() => setType("protected")}>비공개방</label>
          <input className="mc-type" type="radio" id="mc-secret" value="secret" checked={type === "secret"} onChange={() => {}} />        
          <label className="mc-type-label" htmlFor="mc-secret" onClick={() => setType("secret")}>비밀방</label>
        </div>
      </div>
      <div className="mc-content-container">
        <label htmlFor="mc-password">비밀번호:</label>
        <input id="mc-password" type="password" required minLength={4} maxLength={10} placeholder="비밀번호를 입력하세요." size={10}/>
      </div>
      <div className="mc-content-container">
        <label htmlFor="mc-max">최대 인원:</label>
        <select name="mc-max" id="mc-max" required>
          <option className="mc-option" value="2">2명</option>
          <option className="mc-option" value="4">4명</option>
          <option className="mc-option" value="6">6명</option>
          <option className="mc-option" value="8">8명</option>
          <option className="mc-option" value="10">10명</option>
        </select>
      </div>
    </div>
  );
};

export default MakeChatRoom;