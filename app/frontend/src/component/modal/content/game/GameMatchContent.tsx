import { Dispatch, FC, SetStateAction } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import Loading from "../../../loading/Loading";
import "/src/scss/content/game/GameMatchContent.scss";

interface gameMatchContentProps
  extends RouteComponentProps<{matchType: string}> {
  setIsMatched: Dispatch<SetStateAction<{
    isMatched: boolean;
    roomId: string;
    opponent: string;
  }>>;
}

const GameMatchContent: FC<gameMatchContentProps> = ({match: {params}, setIsMatched}): JSX.Element => {
  return (
    <div id="game-match-content">
      <Loading width={400} height={300} color="#62C375"/>
      {params.matchType === "normal-match" && "일반 게임 찾는중..."}
      {params.matchType === "ladder-match" && "레더 게임 찾는중..."}
      <button onClick={() => setIsMatched({
        isMatched: true,
        roomId: "13",
        opponent: "아무개"
      })}>수동 매칭</button>
    </div>
  );
}

export default withRouter(GameMatchContent);