import { fabric } from "fabric";
import { FC, useState, useEffect, useRef } from "react";
import { RouteComponentProps, withRouter, useHistory, Redirect } from "react-router-dom";
import "/src/scss/content/game/GameRoomContent.scss";
import { io } from "socket.io-client";

interface MatchInfo {
  lPlayerNickname: string,
  lPlayerAvatarUrl: string,
  lPlayerScore: number,
  rPlayerNickname: string,
  rPlayerAvatarUrl: string,
  rPlayerScore: number,
  viewNumber: number,
  myName: string,
}

const GameRoomContent: FC<{socket: any} & RouteComponentProps> = ({socket, match: {params}}) => {
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
  const [init, setInit] = useState(0);
  const [isExit, setIsExit] = useState(false);
  const [showExitButton, setShowExitButton] = useState(false);

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
    viewNumber: 0,
    myName: '',
  });

  const onClickGiveUp = () => {
    socket.emit("giveUp");
  }

  const onClickExit = () => {
    socket.disconnect();
    removeEventListener("keydown", keyDownEvent);
    removeEventListener("keyup", keyUpEvent);
    setIsExit(true);
  }

  const [downKey, _setDownKey] = useState(0);
  const downKeyRef = useRef(downKey)
  const [upKey, _setUpKey] = useState(0);
  const upKeyRef = useRef(upKey);

  const setDownKey = (x) => {
    downKeyRef.current = x;
    _setDownKey(x);
  }

  const setUpKey = (x) => {
    upKeyRef.current = x;
    _setUpKey(x);
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
   * @brief 키보드 이벤트
   *        키의 눌림 상태를 변경한다.
   *        여기서 서버로 상태를 전송
   */
  
  const keyDownEvent = (e: KeyboardEvent) => {
    
    if (e.code === "ArrowDown" && downKeyRef.current == 0) {
      socket.emit("keyEvent", {arrowUp: upKeyRef.current, arrowDown: true});
      setDownKey(1);
    }
    else if (e.code === "ArrowUp" && upKeyRef.current == 0) {
      socket.emit("keyEvent", {arrowUp: true, arrowDown: downKeyRef.current});
      setUpKey(1);
    }
  };
  
  const keyUpEvent = (e: KeyboardEvent) => {
    if (e.code === "ArrowDown") {
      socket.emit("keyEvent", {arrowUp: upKeyRef.current, arrowDown: false});
      setDownKey(0);
    }
    else if (e.code === "ArrowUp") {
      socket.emit("keyEvent", {arrowUp: false, arrowDown: downKeyRef.current});
      setUpKey(0);
    }
  };
  
  /*!
   * @brief 캔버스 초기화
   *        맨 처음 배경과 양쪽 바, 공을 그려준다
   */
  useEffect(() => {
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
      setResultWindow(initResultWindow(`YOU ${data}`));
    })

    addEventListener("keydown", keyDownEvent);
    addEventListener("keyup", keyUpEvent)

    return (() => {
      socket.disconnect();
      removeEventListener("keydown", keyDownEvent);
      removeEventListener("keyup", keyUpEvent);
    })
  }, []);

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
      setShowExitButton(true);
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

  // useEffect(() => {
    
  // }, [matchInfo])

  return (
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
      <button className="give-up" onClick={onClickGiveUp}>기권</button>
    </div>
    <div className="ingame-footer">
      {showExitButton ? <button className="exit" onClick={onClickExit}>나가기</button> : null}
    </div>
    <canvas id="ping-pong"></canvas>
    {isExit && <Redirect to="/mainpage" />}
    </>
  );
};

export default withRouter(GameRoomContent);