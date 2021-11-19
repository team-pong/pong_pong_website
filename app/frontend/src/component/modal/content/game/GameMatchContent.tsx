import { Dispatch, FC, SetStateAction, useEffect } from 'react';
import { RouteComponentProps, useLocation, withRouter } from 'react-router-dom';
import Loading from "../../../loading/Loading";
import { io } from "socket.io-client";
import "/src/scss/content/game/GameMatchContent.scss";
import { GameInviteType } from './GameContent';

interface gameMatchContentProps extends RouteComponentProps<{matchType: string}> {
  setIsMatched?: Dispatch<SetStateAction<{
    isMatched: boolean;
    roomId: string;
    socket: any;
  }>>;
}

const GameMatchContent: FC<gameMatchContentProps> = ({match: {params, url}, setIsMatched}): JSX.Element => {
 
  const {state} = useLocation<GameInviteType>();
  console.log("MatchFC state test: ", state);

  useEffect(() => {
    console.log("Match useEffect@");
    const url_params = url.split('/');
    const map = url_params.pop();
    let isMatched = false;

    setIsMatched({isMatched: false, roomId: '', socket: null});
    const socket = io(`${global.BE_HOST}/game`);

    /* state가 없으면 게임 찾기로 들어온 것이니 map 정보만 보내는데,
       state가 있으면 대전 신청이니 target로 함께 백엔드로 보낸다 */
    if (!state) {
      socket.emit(params.matchType, {map: map});
    } else {
      socket.emit("invite", {map: map, target: state.target});
    }

    /* matched 이후로는 같은 값을 가지고 (여기서 opponent는 대전신청인 경우 target이 돼야 함)
       진행되니까 게임을 진행시킨다.
       그런데 여기서 matched가 되는 경우는 상대방이 DM 으로 온 초대를 승낙할 경우여야 한다
       Caution! 여기서 새로고침을 하면 그래도 문제가 없어보이네?
       Error! 근데 여기서 왜인지 모르겠는데 대전신청에선 새로고침하면 option까지만 다시 렌더된다. */
    socket.on("matched", ({roomId}) => {
      isMatched = true;
      setIsMatched({isMatched: true, roomId, socket});
    });
    
    return (() => {
      if (isMatched === false) {
        socket.disconnect();
      }
    });
  }, []);

  if (state) {
    return (
      <div id="game-match-content">
        <img className="gm-avatar" src={state.targetAvatar} alt="상대 아바타 이미지" />
        <span className="gm-target">{state.target}</span>
        <Loading style={{width:200, height:100}} color="#62C375"/>
        <span className="gm-msg">{`${state.target} 의 응답 대기중...`}</span>
      </div>
    );
  } else {
    return (
      <div id="game-match-content">
        <Loading style={{width:400, height:300}} color="#62C375"/>
        {params.matchType === "normal" && "일반 게임 찾는중..."}
        {params.matchType === "ladder" && "레더 게임 찾는중..."}
      </div>
    );
  }
}

export default withRouter(GameMatchContent);