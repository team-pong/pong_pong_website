import { FC, useEffect } from "react";
import io from "socket.io-client";

const GameMatchContent: FC<{matchType: string}> = ({matchType}): JSX.Element => {

  useEffect(() => {
    const socket = io("http://127.0.0.1:3001/game");
  }, []);

  return (
    <div id="game-match-content">
      {`매치메이킹중(${matchType})...`}
    </div>
  );
}

export default GameMatchContent;