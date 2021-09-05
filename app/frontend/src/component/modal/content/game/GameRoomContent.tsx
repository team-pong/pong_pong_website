import { FC, Dispatch, SetStateAction, useEffect } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";

interface matchInfo {
  isMatched: boolean,
  roomId: string,
  opponent: string
}

interface gameRoomContentProps {
  matchInfo: matchInfo,
  setIsMatched: Dispatch<SetStateAction<matchInfo>>
}

const GameRoomContent: FC<gameRoomContentProps & RouteComponentProps> = ({matchInfo, setIsMatched}): JSX.Element => {

  useEffect(() => {
    return (() => {
      setIsMatched({
        isMatched: false,
        roomId: "",
        opponent: ""
      });
    });
  }, []);

  return (
    <>
      <h1>GameRoom</h1>
      roomId: {matchInfo.roomId}<br />
      opponent: {matchInfo.opponent}<br />
    </>
  );
};

export default withRouter(GameRoomContent);