import { FC, useEffect, Dispatch, SetStateAction } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import io from "socket.io-client";
import Loading from "../../../loading/Loading";
import "/src/scss/content/game/GameMatchContent.scss";

interface gameMatchContentProps {
  setIsMatched: Dispatch<SetStateAction<{
    isMatched: boolean,
    roomId: string,
    opponent: string
  }>>;
}

const GameMatchContent: FC<gameMatchContentProps & RouteComponentProps> = ({match: {params}, setIsMatched}): JSX.Element => {

  useEffect(() => {
    const socket = io("http://127.0.0.1:3001/game", {withCredentials: true});
    socket.emit((params as any).matchType.split("-")[0]);
    socket.on('matched', (data: {roomId: string, opponent: string}) => {
      setIsMatched({isMatched: true, roomId: data.roomId, opponent: data.opponent});
    });
    return (() => {socket.disconnect();});
  }, []);

  return (
    <div id="game-match-content">
      <Loading width={400} height={300} color="#62C375"/>
      {(params as any).matchType.split("-")[0] === "normal" && <span className="game-searching-message">일반 게임을 찾는중...</span>}
      {(params as any).matchType.split("-")[0] === "ladder" && <span className="game-searching-message">래더 게임을 찾는중...</span>}

      {/*테스트용 버튼*/}
      {/*추후에 혼자서도 매칭을 테스트 할 수 있는 수단이 생기면 제거 요망*/}
      <button onClick={() => setIsMatched({isMatched: true, roomId: "12", opponent: "asdf"})}>수동 매칭 테스트</button>

    </div>
  );
}

export default withRouter(GameMatchContent);