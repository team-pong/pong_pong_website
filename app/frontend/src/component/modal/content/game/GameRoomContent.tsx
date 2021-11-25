import { fabric } from "fabric";
import { FC, useState, useEffect, useRef, useContext } from "react";
import { RouteComponentProps, withRouter, Redirect } from "react-router-dom";
import "/src/scss/content/game/GameRoomContent.scss";
import { SetDmInfoContext, SetUserInfoContext, UserInfoContext } from "../../../../Context";
import NoResult from "../../../noresult/NoResult";
import EasyFetch from "../../../../utils/EasyFetch";

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

const GameRoomContent: FC<{socket: any} & RouteComponentProps> = ({socket}) => {

  const canvasWidth = 700;
  const canvasHeight = 450;

  const myInfo = useContext(UserInfoContext);
  const setUserInfo = useContext(SetUserInfoContext);
  const setDmInfo = useContext(SetDmInfoContext);
  const [map, setMap] = useState(3);
  const [canvas, setCanvas] = useState<fabric.StaticCanvas>();
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

  const [obsRect, setObsRect] = useState<{
    obsRect00: fabric.Rect,
    obsRect01: fabric.Rect,
    obsRect02: fabric.Rect,
    obsRect03: fabric.Rect
  }>(null);

  const [obsCircle, setObsCircle] = useState<{
    obsCircle00: fabric.Circle,
    obsCircle01: fabric.Circle,
    obsCircle02: fabric.Circle,
    obsCircle03: fabric.Circle,
  }>(null)

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

  
  const initRect = ([x, y, width, height]) => {
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

  const initCircle = ([x, y, r]) => {
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

  const getUserInfo = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/users/myself`);
    const res = await easyfetch.fetch();
    return res;
  }
  
  /*!
   * @brief 캔버스 초기화
   *        맨 처음 배경과 양쪽 바, 공을 그려준다
   */
  useEffect(() => {
    if (socket === null) return;
    socket.on("init", (data) => {
      setMap(data.type);
      setCanvas(initCanvas());
      setLeftBar(initRect(data.bar00));
      setRightBar(initRect(data.bar01));
      setBall(initBall(data.ball[0], data.ball[1]));
      if (data?.type == 1) {
        setObsRect((prev) => ({...prev, obsRect00: initRect(data.obstacle.obs00)}));
        setObsRect((prev) => ({...prev, obsRect01: initRect(data.obstacle.obs01)}));
        setObsRect((prev) => ({...prev, obsRect02: initRect(data.obstacle.obs02)}));
        setObsRect((prev) => ({...prev, obsRect03: initRect(data.obstacle.obs03)}));
      } else if (data?.type == 2) {
        setObsCircle((prev) => ({...prev, obsCircle00: initCircle(data.obstacle.obs00)}));
        setObsCircle((prev) => ({...prev, obsCircle01: initCircle(data.obstacle.obs01)}));
        setObsCircle((prev) => ({...prev, obsCircle02: initCircle(data.obstacle.obs02)}));
        setObsCircle((prev) => ({...prev, obsCircle03: initCircle(data.obstacle.obs03)}));
      }
      setInit(1);
    });

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

    addEventListener("keydown", keyDownEvent);
    addEventListener("keyup", keyUpEvent)

    return (() => {
      socket.disconnect();
      getUserInfo().then((res) => {setUserInfo(res)});
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
        canvas.add(obsCircle.obsCircle00);
        canvas.add(obsCircle.obsCircle01);
        canvas.add(obsCircle.obsCircle02);
        canvas.add(obsCircle.obsCircle03);
      }
      else if (map == 1) {
        canvas.add(obsRect.obsRect00);
        canvas.add(obsRect.obsRect01);
        canvas.add(obsRect.obsRect02);
        canvas.add(obsRect.obsRect03);
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

  /*!
   * @author donglee
   * @brief 게임 진행이 되면 디엠이 켜져있을 경우 닫기
   */
  useEffect(() => {
    setDmInfo({
      isDmOpen: false,
      target: "",
    });
  }, []);

  if (socket === null) return (
    <NoResult
      style={{
        width: "50%",
        height: "50%",
        fontSize: "200%"
      }}
      text={"잘못된 접근입니다."}/>
  );

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