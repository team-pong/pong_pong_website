import { FC, useState, Dispatch, SetStateAction } from "react";
import { Route, RouteComponentProps, useHistory, withRouter } from "react-router";
import { Link, useLocation } from "react-router-dom";
import Modal from "../../Modal";
import GameMatchContent from "./GameMatchContent";
import "/src/scss/content/game/GameOptionContent.scss";

enum MAP {
  map0,
  map1,
  map2
}

function getMapImg(mapType: MAP): string {
  switch(mapType) {
    default:
      return ("/public/game-map/map1.png");
    case MAP.map1:
      return ("/public/game-map/map2.png");
    case MAP.map2:
      return ("/public/game-map/map3.png");
  }
}

interface GameOptionContent extends RouteComponentProps {
  setIsMatched?: Dispatch<SetStateAction<{
    isMatched: boolean;
    roomId: string;
    opponent: string;
    position: string;
    socket: any;
  }>>;
}

export interface StateType {
  target: string,
  targetAvatar: string,
}

const GameOptionContent: FC<GameOptionContent> = ({match: {url, path}, setIsMatched}) => {
  const [mapSelector, setMapSelector] = useState(0);
  const history = useHistory();

  const {state} = useLocation<StateType>();

  return (
    <div id="game-option-content">
      <img
        className="game-option-closer"
        src="/public/arrow.svg"
        onClick={() => history.goBack()} />
      <img
        className="map-preview"
        src={getMapImg(mapSelector)} />
      <form className="map-select-form">
        <div className="map-btn-group">
          <button className="map-btn-00" onClick={(e) => {e.preventDefault();setMapSelector(0)}}>일반</button>
          <button className="map-btn-01" onClick={(e) => {e.preventDefault();setMapSelector(1)}}>막대기</button>
          <button className="map-btn-02" onClick={(e) => {e.preventDefault();setMapSelector(2)}}>거품</button>
        </div>
        {/* setIsMatched가 없으면 대전신청으로 보이게 한다 */}
        <Link to={{pathname:`${url}/${mapSelector}`, state:state}} className="start" >{setIsMatched ? '게임 찾기' : '대전 신청'}</Link>
      </form>
      <Route path={`${path}/:map`}>
        <Modal id={Date.now()} smallModal content={<GameMatchContent setIsMatched={setIsMatched} />}/>
      </Route>
    </div>
  );
}

export default withRouter(GameOptionContent);