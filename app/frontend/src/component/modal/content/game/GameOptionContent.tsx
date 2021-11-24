import { FC, useState, Dispatch, SetStateAction, useContext } from "react";
import { Route, RouteComponentProps, useHistory, withRouter } from "react-router";
import { Link, Redirect, useLocation } from "react-router-dom";
import { SetDmInfoContext, UserInfoContext } from "../../../../Context";
import Modal from "../../Modal";
import { GameInviteType } from "./GameContent";
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
    socket: any;
  }>>;
}

const GameOptionContent: FC<GameOptionContent> = ({match: {url, path}, setIsMatched}) => {
  const [mapSelector, setMapSelector] = useState(0);
  const history = useHistory();

  const setDmInfo = useContext(SetDmInfoContext);
  const myInfo = useContext(UserInfoContext);
  const {state} = useLocation<GameInviteType>();

  /*!
   * @author donglee
   * @brief state의 값이 있는 경우 대전신청을 눌렀을 때 DM으로 초대를 보냄
   */
  const sendDmRequest = () => {
    if (state && state.targetAvatar) {
      setDmInfo({
        isDmOpen: true,
        target: state.target,
        gameRequest: {
          from: myInfo.nick,
          gameMap: mapSelector,
        },
      });
    }
  };

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
        {/* 대전신청의 경우 state에 값이 전달된다 */}
        <Link to={{pathname:`${url}/${mapSelector}`, state:state}} className="start" onClick={sendDmRequest}>{!state ? '게임 찾기' : '대전 신청'}</Link>
      </form>
      <Route path={`${path}/:map`}>
        <Modal id={Date.now()} smallModal content={<GameMatchContent setIsMatched={setIsMatched} />}/>
      </Route>
      {state && state.mapId && <Redirect to={{pathname: `${url}/${state.mapId}`, state: state}} /> }
    </div>
  );
}

export default withRouter(GameOptionContent);