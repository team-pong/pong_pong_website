import { Dispatch, FC, SetStateAction } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

interface gameMatchContentProps extends RouteComponentProps {
  setIsMatched: Dispatch<SetStateAction<{
    isMatched: boolean;
    roomId: string;
    opponent: string;
  }>>;
}

const GameMatchContent: FC<gameMatchContentProps> = ({match: {params}, setIsMatched}): JSX.Element => {
  return (
    <div id="game-match-content">
      {(params as any).matchType}
      <button onClick={() => setIsMatched({
        isMatched: true,
        roomId: "13",
        opponent: "아무개"
      })}>수동 매칭</button>
    </div>
  );
}

export default withRouter(GameMatchContent);