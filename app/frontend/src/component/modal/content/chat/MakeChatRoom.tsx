import { FC } from "react";

const MakeChatRoom: FC = (props): JSX.Element => {

  const makeChatRoom = (e) => {
    console.log("tesT: ",  e);
  };

  return (
    <>
      <form onSubmit={makeChatRoom}>
        <label htmlFor="mc-chat-title"></label>
        대화방 이름 :<input id="mc-chat-title" type="text"/>
        대화방 타입 :<input id="mc-chat-type" type="text"/>
        비밀번호: <input id="mc-chat-password" type="text"/>
        최대인원: <input id="mc-chat-max" type="number"/>
      </form>
      <button>만들기</button>
    </>
  );
};

export default MakeChatRoom;