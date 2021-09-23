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

  const onValueChange = (e) => {
    setType(e.target.value);
  }
  /* TODO: 도대체 어떻게 해야 라디오를 적절하게 사용할 수 있는 것인가 시팔 */
  return (
    <>
      <h2>채팅방 만들기</h2>
      <form onSubmit={makeChatRoom}>
        <div>채팅방 이름</div>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)}/>
        <div>공개범위</div>
        <label htmlFor="mc-public">
          <input type="radio" id="mc-public" value="public" checked={type === "public"} onClick={() => setType("public")} />
          공개방
        </label>
        <label htmlFor="mc-protected">
          <input type="radio" id="mc-protected" value="protected" checked={type === "protected"} onClick={() => setType("protected")} />
          비공개방
        </label>
        <label htmlFor="mc-secret">
          <input type="radio" id="mc-secret" value="secret" checked={type === "secret"} onClick={() => setType("secret")} />
          시크릿방
        </label>
      </form>
    </>
  );
};

export default MakeChatRoom;