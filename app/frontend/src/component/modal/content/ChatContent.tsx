import { FC, useEffect, useState } from "react"

/*!
 * @author yochoi
 * @brief 더미 데이터를 만드는 함수와 인터페이스
 */

interface dummyDataInterface {
  name: string,
  type: string,
  numOfMembers: number
}

function makeDummyData(): Array<dummyDataInterface> {
  let dummyData: Array<dummyDataInterface> = [];
  for (let i = 0; i < 50; ++i) {
    dummyData.push({
      name: `chat room ${i}`,
      type: (i % 2 === 0 ? 'public' : 'secret'),
      numOfMembers: i
    })
  }
  return dummyData;
}

/*!
 * @author yochoi
 * @brief ChatContent
 */

const ChatList: FC<{setChatID: (chatID: string) => void}> = ({setChatID}): JSX.Element => {
  const dummyData = makeDummyData();

  const makeChatList = (chatRoom: dummyDataInterface, idx: number) => {
    return (
      <li key={idx} onClick={() => setChatID(chatRoom.name)}>
        {chatRoom.name}/{chatRoom.type}/{chatRoom.numOfMembers}
      </li>
    );
  };

  return (
    <div id="chatlist">
      <ul>
        {dummyData.map(makeChatList)}
      </ul>
    </div>
  );
}

const ChatRoom: FC<{chatID: string}> = ({chatID}): JSX.Element => {

  useEffect(() => {
    // get chatID->fetch chat log data
    // socket connect
  }, []);

  return (<h1>{chatID}</h1>);
}

const ChatContent: FC = (): JSX.Element => {
  const [chatID, setChatID] = useState("");
  if (chatID === "") {
    return (<ChatList setChatID={setChatID}/>);
  } else {
    return (<ChatRoom chatID={chatID}/>);
  }
}

export default ChatContent;