import { fabric } from "fabric";
import { FC, useState, useEffect, useContext, useRef } from "react";
import { RouteComponentProps, withRouter, Redirect, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import { UserInfoContext } from "../../../../Context";

interface MatchInfo {
  lPlayerNickname: string,
  lPlayerAvatarUrl: string,
  lPlayerScore: number,
  rPlayerNickname: string,
  rPlayerAvatarUrl: string,
  rPlayerScore: number,
  viewNumber: number
}

const GameSpectateContent: FC<RouteComponentProps> = () => {
  const [isInvalidMatch, setIsInvalidMatch] = useState(false);
  const myInfo = useContext(UserInfoContext);
  const [socket, _setSocket] = useState(null);
  const socketRef = useRef(socket);
  const setSocket = (data) => {
    socketRef.current = data;
    _setSocket(data);
  }
  const [map, setMap] = useState(3);
  const [canvas, setCanvas] = useState<fabric.StaticCanvas>();
  const [canvasWidth, setCanvasWidth] = useState(700);
  const [canvasHeight, setCanvasHeight] = useState(450);
  const [leftBar, setLeftBar] = useState<fabric.Rect>();
  const [rightBar, setRightBar] = useState<fabric.Rect>();
  const [countdownWindow, setCountdownWindow] = useState<fabric.Text>();
  const [resultWindow, setResultWindow] = useState<fabric.Text>();
  const [ball, setBall] = useState<fabric.Circle>();
  const [ballX, setBallX] = useState(350);
  const [ballY, setBallY] = useState(150);
  const [leftY, setLeftY] = useState(150);
  const [rightY, setRightY] = useState(150);
  const [socketInit, setSocketInit] = useState(false);
  const [init, setInit] = useState(0);
  const [isExit, setIsExit] = useState(false);

  const [obsRect00, setObsRect00] = useState<fabric.Rect>();
  const [obsRect01, setObsRect01] = useState<fabric.Rect>();
  const [obsRect02, setObsRect02] = useState<fabric.Rect>();
  const [obsRect03, setObsRect03] = useState<fabric.Rect>();
  
  const [obsCircle00, setObsCircle00] = useState<fabric.Circle>();
  const [obsCircle01, setObsCircle01] = useState<fabric.Circle>();
  const [obsCircle02, setObsCircle02] = useState<fabric.Circle>();
  const [obsCircle03, setObsCircle03] = useState<fabric.Circle>();

  const [matchInfo, setMatchInfo] = useState<MatchInfo>({
    lPlayerNickname: '',
    lPlayerAvatarUrl: '',
    lPlayerScore: 0,
    rPlayerNickname: '',
    rPlayerAvatarUrl: '',
    rPlayerScore: 0,
    viewNumber: 0
  });

  const query = new URLSearchParams(useLocation().search)

  const onClickExit = () => {
    socket.disconnect();
    setIsExit(true);
  }

  /*!
   * @brief canvas와 양쪽 사이드바, 공 초기 설정
   */
  const initCanvas = () => {
    return new fabric.StaticCanvas('ping-pong', {width: canvasWidth, height: canvasHeight, backgroundColor: "white"});
  };

  const initCountdownWindow = (text) => {
    return new fabric.Textbox(text, {
      width: 300,
      top: 5,
      left: 5,
      fontSize: 40,
      textAlign: 'center',
    });
  }

  const initResultWindow = (text) => {
    return new fabric.Textbox(text, {
      width: 300,
      top: 5,
      left: 5,
      fontSize: 40,
      textAlign: 'center',
    });
  }

  
  const initBar = (x, y, width, height) => {
    width = width - x;
    height = height - y;
    return new fabric.Rect({
      left: x,
      top: y,
      fill: 'black',
      width: width,
      height: height,
    });
  }
  
  const initBall = (x, y) => {
    return new fabric.Circle({
      left: x - 10,
      top: y - 10,
      fill: 'black',
      radius: 10,
    })
  }

  const initCircle = (x, y, r) => {
    return new fabric.Circle({
      left: x - r,
      top: y - r,
      fill: 'black',
      radius: r,
    })
  }
  
  /*!
   * @brief 캔버스 초기화
   *        맨 처음 배경과 양쪽 바, 공을 그려준다
   */
  useEffect(() => {
    setSocket(io(`${global.BE_HOST}/game`));
    setSocketInit(true);

    return (() => {
      socketRef.current.disconnect();
    })
  }, []);

  useEffect(() => {
    if (socketInit) {
      socket.emit("spectate", {nick: query.get("nick")});

      socket.on("invalidMatch", () => {
        setIsInvalidMatch(true);
      })
      
      socket.on("init", (data) => {
        setMap(data.type);
        setCanvas(initCanvas());
        setLeftBar(initBar(data.bar00[0], data.bar00[1], data.bar00[2], data.bar00[3]));
        setRightBar(initBar(data.bar01[0], data.bar01[1], data.bar01[2], data.bar01[3]));
        setBall(initBall(data.ball[0], data.ball[1]));
        if (data?.type == 1) {
          setObsRect00(initBar(data.obstacle.obs00[0], data.obstacle.obs00[1], data.obstacle.obs00[2], data.obstacle.obs00[3]));
          setObsRect01(initBar(data.obstacle.obs01[0], data.obstacle.obs01[1], data.obstacle.obs01[2], data.obstacle.obs01[3]));
          setObsRect02(initBar(data.obstacle.obs02[0], data.obstacle.obs02[1], data.obstacle.obs02[2], data.obstacle.obs02[3]));
          setObsRect03(initBar(data.obstacle.obs03[0], data.obstacle.obs03[1], data.obstacle.obs03[2], data.obstacle.obs03[3]));
        } else if (data?.type == 2) {
          setObsCircle00(initCircle(data.obstacle.obs00[0], data.obstacle.obs00[1], data.obstacle.obs00[2]));
          setObsCircle01(initCircle(data.obstacle.obs01[0], data.obstacle.obs01[1], data.obstacle.obs01[2]));
          setObsCircle02(initCircle(data.obstacle.obs02[0], data.obstacle.obs02[1], data.obstacle.obs02[2]));
          setObsCircle03(initCircle(data.obstacle.obs03[0], data.obstacle.obs03[1], data.obstacle.obs03[2]));
        }
        setInit(1);
      })

      socket.on("update", (data) => {
        setLeftY(data.bar00[1]);
        setRightY(data.bar01[1]);
        setBallX(data.ball[0] - 10);
        setBallY(data.ball[1] - 10);
      })

      socket.on("setMatchInfo", (data: MatchInfo) => {
        setMatchInfo(data);
      })

      socket.on("startCount", () => {
        setCountdownWindow(initCountdownWindow('3'));
      })

      socket.on("matchEnd", (data) => {
        if (data.winner == myInfo.user_id) {
          setResultWindow(initResultWindow(`YOU WIN`));
        } else if (data.loser == myInfo.user_id) {
          setResultWindow(initResultWindow(`YOU LOSE`));
        } else {
          setResultWindow(initResultWindow(`MATCH END`));
        }
      })
    }
  }, [socketInit])

  useEffect(() => {
    if (canvas) {
      setTimeout(() => {
        countdownWindow.set({
          text: '2'
        });
        canvas.renderAll();
      }, 1000);
      setTimeout(() => {
        countdownWindow.set({
          text: '1'
        });
        canvas.renderAll();
      }, 2000);
      setTimeout(() => {
        countdownWindow.set({
          text: ''
        });
        canvas.renderAll();
      }, 3000)
      countdownWindow.set({
        top: 125,
        left: 200,
      });
      canvas.add(countdownWindow);
    }
  }, [countdownWindow])

  useEffect(() => {
    if (canvas) {
      canvas.remove(countdownWindow);
      resultWindow.set({
        top: 125,
        left: 200,
      });
      canvas.add(resultWindow);
      canvas.renderAll();
    }
  }, [resultWindow])

  useEffect(() => {
    if (init) {
      canvas.add(ball);
      canvas.add(leftBar);
      canvas.add(rightBar);
      if (map == 2) {
        canvas.add(obsCircle00);
        canvas.add(obsCircle01);
        canvas.add(obsCircle02);
        canvas.add(obsCircle03);
      }
      else if (map == 1) {
        canvas.add(obsRect00);
        canvas.add(obsRect01);
        canvas.add(obsRect02);
        canvas.add(obsRect03);
      }
    }
  }, [init])
  
  /*!
   * @brief 왼쪽 막대가 움직이는 경우 처리
   */
  useEffect(() => {
    if (canvas) {
      leftBar.set({top: leftY});
      canvas.renderAll();
    }
  }, [leftY]);
  
  /*!
   * @brief 오른 막대가 움직이는 경우 처리
   */
  useEffect(() => {
    if (canvas) {
      rightBar.set({top: rightY});
      canvas.renderAll();
    }
  }, [rightY]);

  useEffect(() => {
    if (canvas) {
      ball.set({left: ballX, top: ballY})
      canvas.renderAll();
    }
  }, [ballX, ballY]);

  if (!isInvalidMatch) return (
    <>
    <div className="ingame-match-info">
      <div className="left-player">
        <div className="left-player-profile"><img src={matchInfo.lPlayerAvatarUrl}/></div>
        <div className="left-player-nickname">{matchInfo.lPlayerNickname}</div>
        <div className="left-player-score">{matchInfo.lPlayerScore}</div>
      </div>
      vs
      <div className="right-player">
        <div className="right-player-score">{matchInfo.rPlayerScore}</div>
        <div className="right-player-nickname">{matchInfo.rPlayerNickname}</div>
        <div className="right-player-profile"><img src={matchInfo.rPlayerAvatarUrl}/></div>
      </div>
    </div>
    <div className="ingame-side-bar">
      <div className="view-number">view {matchInfo.viewNumber}</div>
    </div>
    <div className="ingame-footer">
      <button className="exit" onClick={onClickExit}>나가기</button>
    </div>
    <canvas id="ping-pong"></canvas>
    {isExit && <Redirect to="/mainpage" />}
    </>
  );
  return (<>잘못된 접근입니다.</>)
};

export default withRouter(GameSpectateContent);