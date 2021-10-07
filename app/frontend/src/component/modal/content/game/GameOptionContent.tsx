import { FC, useState } from "react";
import { RouteComponentProps, useHistory, withRouter } from "react-router";
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

const GameOptionContent: FC<RouteComponentProps> = ({match: {url}}) => {

  const [selectedMap, setSelectedMap] = useState<MAP>(MAP.map0);

  const history = useHistory();

  return (
    <div id="game-option-content">
      <img
        className="game-option-closer" 
        src="/public/arrow.svg"
        onClick={() => history.goBack()} />
      <img
        className="map-preview"
        src={getMapImg(selectedMap)} />
      <form className="map-select-form">
        <label className="map-selectors">
          <label onClick={() => setSelectedMap(MAP.map0)}>
            <input type="radio" checked={selectedMap === MAP.map0} onChange={() => {}}/>맵 0
          </label>
          <label onClick={() => setSelectedMap(MAP.map1)}>
            <input type="radio" checked={selectedMap === MAP.map1} onChange={() => {}}/>맵 1
          </label>
          <label onClick={() => setSelectedMap(MAP.map2)}>
            <input type="radio" checked={selectedMap === MAP.map2} onChange={() => {}}/>맵 2
          </label>
        </label>
        <button onClick={() => {history.push(`${url}/${selectedMap}`)}}>게임 찾기</button>
      </form>
    </div>
  );
}

export default withRouter(GameOptionContent);