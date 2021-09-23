import { FC, useEffect, useState } from "react";
import "/src/scss/content/chat/MakeChatRoom.scss";
import EasyFetch from "../../../../utils/EasyFetch";

const MakeChatRoom: FC = (props): JSX.Element => {

  const makeChatRoom = (e) => {
    e.preventDefault();
    console.log("cubsuimt1");
  };

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

  useEffect(() => {
    // test();
  }, []);

  return (
    <>
      <h2>채팅방 만들기</h2>
      <form onSubmit={makeChatRoom}>
        <div>채팅방 이름</div>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)}/>
        <div>공개범위</div>
        <input type="radio" id="mc-public" value="공개방" checked />
        <label htmlFor="mc-public">공개방</label>
        <input type="radio" id="mc-protected" value="비공개방" />
        <label htmlFor="mc-protected">비공개방</label>
        <input type="radio" id="mc-secret" value="시크릿방" />
        <label htmlFor="mc-secret">시크릿방</label>
      </form>
    </>
  );
};

export default MakeChatRoom;