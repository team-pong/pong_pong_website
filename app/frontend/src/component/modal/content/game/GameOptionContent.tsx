import { FC, useState } from "react";
import "/src/scss/content/game/GameOptionContent.scss";

const IMG_BLACK: string = "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";
const IMG_GRAY: string = "data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==";
const IMG_RED: string = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";

enum MAP {
  map0,
  map1,
  map2
}

function getMapImg(mapType: MAP): string {
  switch(mapType) {
    default:
      return (IMG_BLACK);
    case MAP.map1:
      return (IMG_GRAY);
    case MAP.map2:
      return (IMG_RED);
  }
}

const GameOptionContent: FC = () => {

  const [selectedMap, setSelectedMap] = useState<MAP>(MAP.map0);

  return (
    <div id="game-option-content">
      <img
        className="map-preview"
        src={getMapImg(selectedMap)} />
      <form className="map-select-form" onSubmit={() => console.log("onsubmit")}>
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
        <input type="submit" value="게임 찾기" />
      </form>
    </div>
  );
}

export default GameOptionContent;