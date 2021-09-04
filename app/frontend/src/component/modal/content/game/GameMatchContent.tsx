import { FC, useEffect } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import io from "socket.io-client";

const GameMatchContent: FC<RouteComponentProps> = ({match: {params}}): JSX.Element => {

  useEffect(() => {
    const socket = io("http://127.0.0.1:3001/game", {withCredentials: true});
    socket.emit(`${JSON.stringify(params)}`);
    socket.on('matched', (data: {roomId: string, opponent: string}) => {
      console.log(JSON.stringify(data));
    });
    return (() => {socket.disconnect();});
  }, []);

  return (
    <div id="game-match-content">
      {`매치메이킹중(${(params as any).matchType})...`}
    </div>
  );
}

export default withRouter(GameMatchContent);