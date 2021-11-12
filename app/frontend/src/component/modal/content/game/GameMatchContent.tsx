import { Dispatch, FC, SetStateAction, useEffect } from 'react';
import { RouteComponentProps, useLocation, withRouter } from 'react-router-dom';
import Loading from "../../../loading/Loading";
import { io } from "socket.io-client";
import "/src/scss/content/game/GameMatchContent.scss";
import { StateType } from './GameOptionContent';

interface gameMatchContentProps extends RouteComponentProps<{matchType: string}> {
  setIsMatched?: Dispatch<SetStateAction<{
    isMatched: boolean;
    roomId: string;
    opponent: string;
    position: string;
    socket: any;
  }>>;
}

const GameMatchContent: FC<gameMatchContentProps> = ({match: {params, url}, setIsMatched}): JSX.Element => {
 
  const {state} = useLocation<StateType>();
  /* TODO: state를 location으로 받아와서 invite의 경우에는 avatar target을 보여준다 
    이제 여기서 emit 하고 그런거 전부 다 구현해야 한다. 
    이 화면을 종료하면 emit으로 신청 취소를 보내고
    그러면 DM으로 상대방에게 취소됐다고 알려줘야 한다.
  */

  useEffect(() => {
    const url_params = url.split('/');
    const map = url_params.pop();
    let isMatched = false;

    // setIsMatched가 prop으로 넘어오면 그건 게임 찾기로 진행된 것이다.
    if (setIsMatched) {
      setIsMatched({isMatched: false, roomId: '', opponent: '', position: '', socket: null});
      const socket = io(`${global.BE_HOST}/game`);
      socket.emit(params.matchType, {map: map});
      socket.on("matched", ({roomId, opponent, position}) => {
        isMatched = true;
        setIsMatched({isMatched: true, roomId, opponent, position, socket});
      });
      
      return (() => {
        if (isMatched === false) {
          socket.disconnect();
        }
      })
    }
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