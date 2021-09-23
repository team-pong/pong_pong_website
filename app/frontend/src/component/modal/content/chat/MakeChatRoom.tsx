import { FC, useEffect } from "react";
import EasyFetch from "../../../../utils/EasyFetch";

const MakeChatRoom: FC = (props): JSX.Element => {

  const makeChatRoom = (e) => {
    console.log("cubsuimt1");
    e.preventDefault();
  };

  const test = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/chat`, "POST");
    const body = {
      "title": "아무나 와보던가",
      "type": "public",
      "passwd": "1234",
      "max_people": 10
    };
    const res = await (await easyfetch.fetch(body)).json();

    console.log("res: ", res);
  };

  useEffect(() => {
    test();
  }, []);

  return (
    <>
      <form onSubmit={makeChatRoom}>
        <label htmlFor="mc-chat-title">대화방 이름 :</label>
        <input id="mc-chat-title" type="text"/>
        <label htmlFor="mc-chat-type">대화방 타입 :</label>
        <input id="mc-chat-type" type="text"/>
        <label htmlFor="mc-chat-password">비밀번호: </label>
        <input id="mc-chat-password" type="text"/>
        <label htmlFor="mc-chat-max">최대인원: </label>
        <input id="mc-chat-max" type="number"/>
        <input type="submit" value="adfs"/>
      </form>
    </>
  );
};

export default MakeChatRoom;