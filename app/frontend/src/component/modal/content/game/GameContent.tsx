import { FC } from "react";
import { Link, Route } from "react-router-dom";
import Modal from "../../Modal";
import GameMatchContent from "./GameMatchContent";

const GameContent: FC = (): JSX.Element => {
  return (
    <div id="gmae-content">
      <Link to="/mainpage/game/normal-matching">일반게임</Link>
      <Link to="/mainpage/game/ladder-matching">래더게임</Link>

      <Route path="/mainpage/game/normal-matching">
        <Modal id={Date.now()} smallModal content={<GameMatchContent matchType="normal"/>}/>
      </Route>
      <Route path="/mainpage/game/ladder-matching">
        <Modal id={Date.now()} smallModal content={<GameMatchContent matchType="ladder"/>}/>
      </Route>
    </div>
  );
}

export default GameContent;