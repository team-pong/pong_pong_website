import { FC } from "react";

const GameMatchContent: FC<{matchType: string}> = ({matchType}): JSX.Element => {
  return (
    <div id="game-match-content">
      {`매치메이킹중(${matchType})...`}
    </div>
  );
}

export default GameMatchContent;