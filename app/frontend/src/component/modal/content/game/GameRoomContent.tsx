import { fabric } from "fabric";
import { FC, useState, useEffect, useRef } from "react";
import { RouteComponentProps, withRouter, useHistory } from "react-router-dom";
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
}

const GameRoomContent: FC<{socket: any} & RouteComponentProps> = ({socket, match: {params}}) => {
  const [canvas, setCanvas] = useState<fabric.StaticCanvas>();
  const [canvasWidth, setCanvasWidth] = useState(700);
  const [canvasHeight, setCanvasHeight] = useState(450);
  const [leftBar, setLeftBar] = useState<fabric.Rect>();
  const [rightBar, setRightBar] = useState<fabric.Rect>(); 
  const [ball, setBall] = useState<fabric.Circle>();
  const [ballX, setBallX] = useState(350);
  const [ballY, setBallY] = useState(150);
  const [leftY, setLeftY] = useState(150);
  const [rightY, setRightY] = useState(150);
  const [init, setInit] = useState(0);

  const [matchInfo, setMatchInfo] = useState<MatchInfo>({
    lPlayerNickname: '',
    lPlayerAvatarUrl: '',
    lPlayerScore: 0,
    rPlayerNickname: '',
    rPlayerAvatarUrl: '',
    rPlayerScore: 0,
    viewNumber: 0,
  });


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
      setCanvas(initCanvas());
      setLeftBar(initBar(data.bar00[0], data.bar00[1], data.bar00[2], data.bar00[3]));
      setRightBar(initBar(data.bar01[0], data.bar01[1], data.bar01[2], data.bar01[3]));
      setBall(initBall(data.ball[0], data.ball[1]));
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

    socket.on("disconnected", (data) => {
      console.log(data, 'disconnected! you win');
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
    if (init) {
      canvas.add(ball);
      canvas.add(leftBar);
      canvas.add(rightBar);
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
      <button className="give-up">기권</button>
    </div>
    <div className="ingame-footer"></div>
    <canvas id="ping-pong"></canvas>
    </>
  );
};

export default withRouter(GameRoomContent);