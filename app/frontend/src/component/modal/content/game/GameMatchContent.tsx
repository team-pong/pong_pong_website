import { Dispatch, FC, SetStateAction, useEffect } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import Loading from "../../../loading/Loading";
import { io } from "socket.io-client";
import "/src/scss/content/game/GameMatchContent.scss";

interface gameMatchContentProps extends RouteComponentProps<{matchType: string}> {
  setIsMatched: Dispatch<SetStateAction<{
    isMatched: boolean;
    roomId: string;
    opponent: string;
    position: string;
    socket: any;
  }>>;
}

const GameMatchContent: FC<gameMatchContentProps> = ({match: {params, url}, setIsMatched}): JSX.Element => {

  useEffect(() => {
    const url_params = url.split('/');
    const map = url_params.pop();
    let isMatched = false;
    
    setIsMatched({isMatched: false, roomId: '', opponent: '', position: '', socket: null});
    const socket = io(`${global.BE_HOST}/game`);
    socket.emit(params.matchType, map);
    socket.on("matched", ({roomId, opponent, position}) => {
      isMatched = true;
      setIsMatched({isMatched: true, roomId, opponent, position, socket});
    });
    return (() => {
      if (isMatched === false) {
        console.log('isMatched false');
        socket.disconnect();
      }
    })
  }, []);

  return (
    <div id="game-match-content">
      <Loading style={{width:400, height:300}} color="#62C375"/>
      {params.matchType === "normal" && "일반 게임 찾는중..."}
      {params.matchType === "ladder" && "레더 게임 찾는중..."}
    </div>
  );
}

export default withRouter(GameMatchContent);