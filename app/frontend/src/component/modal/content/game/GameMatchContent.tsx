import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
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
  const [isRejected, setIsRejected] = useState(false);

  useEffect(() => {
    const url_params = url.split('/');
    const map = url_params.pop();
    let isMatched = false;

    setIsMatched({isMatched: false, roomId: '', socket: null});
    const socket = io(`${global.BE_HOST}/game`);

    /*!
     * @author donglee
     * @brief state에 값이 있으면 대전신청 혹은 대전신청을 수락한 경우이므로
     *        target이 정해져있음. 백엔드에 target을 정해서 socket으로 보냄
     */
    if (!state) {
      socket.emit(params.matchType, {map: map});
    } else {
      socket.emit("invite", {map: map, target: state.target});
    }

    /*!
     * @author donglee
     * @brief DM으로 게임 거절을 하면 백엔드에서 현재 소켓으로 알려줘서 렌더링을 바꿔서 사용자에게 거절당했음을 알려줌
     */
    socket.on("rejected", () => {
      setIsRejected(true);
    });

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

  if (isRejected) {
    return ( 
      <div id="game-match-content">
        <span className="gm-reject-msg">상대가 대전 신청을 거절했습니다</span>
      </div>
    );
  }
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