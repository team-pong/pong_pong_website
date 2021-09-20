import { fabric } from "fabric";
import { FC, useState, useEffect } from "react";
import { RouteComponentProps, withRouter, useHistory } from "react-router-dom";

const GameRoomContent: FC<RouteComponentProps> = ({match: {params}}) => {
  const [canvas, setCanvas] = useState<fabric.Canvas>();
  const [canvasWidth, setCanvasWidth] = useState(700);
  const [canvasHeight, setCanvasHeight] = useState(300);
  const [leftBar, setLeftBar] = useState<fabric.Rect>();
  const [rightBar, setRightBar] = useState<fabric.Rect>(); 
  const [ball, setBall] = useState<fabric.Circle>();
  const [ballX, setBallX] = useState(350);
  const [ballY, setBallY] = useState(150);
  const [leftY, setLeftY] = useState(150);
  const [rightY, setRightY] = useState(150);
  const [downKey, setDownKey] = useState(0);
  const [upKey, setUpKey] = useState(0);
  
  /*!
   * @brief canvas와 양쪽 사이드바, 공 초기 설정
   */
  const initCanvas = () => {
    return new fabric.Canvas('myCanvas', {width: canvasWidth, height: canvasHeight, backgroundColor: 'gray'});
  };
  
  const initLeftBar = () => {
    return new fabric.Rect({
      left: 10,
      top: leftY,
      fill: 'black',
      width: 15,
      height: 100,
    });
  }
  
  const initRightBar = () => {
    return new fabric.Rect({
      left: canvasWidth - 25,
      top: leftY,
      fill: 'black',
      width: 15,
      height: 100,
    });
  }
  
  const initBall = () => {
    return new fabric.Circle({
      left: ballX,
      top: ballY,
      fill: 'black',
      radius: 5,
    })
  }
  
  /*!
   * @brief 키보드 이벤트
   *        키의 눌림 상태를 변경한다.
   */
  
  const keyDownEvent = (e: KeyboardEvent) => {
    if (e.code === "ArrowDown" && downKey == 0) {
      setDownKey((downKey) => {return 1});
    }
    else if (e.code === "ArrowUp") {
      setUpKey(() => {return 1});
    }
  };
  
  const keyUpEvent = (e: KeyboardEvent) => {
    if (e.code === "ArrowDown") {
      setDownKey(() => {return 0});
    }
    else if (e.code === "ArrowUp") {
      setUpKey(() => {return 0});
    }
  };
  
  /*!
   * @brief 화살표 키가 눌리거나 떼지는 경우에 서버로 메세지를 보내는 건 여기서 처리
   */
  useEffect(() => {
    if (downKey) {
      setLeftY((leftY) => {return leftY + 5});
    }
    else if (upKey) {
      setLeftY((leftY) => {return leftY - 5});
    }
    // 서버로 내 state 보내기
  }, [downKey, upKey])
  
  /*!
   * @brief 캔버스 초기화
   *        맨 처음 배경과 양쪽 바, 공을 그려준다
   */
  useEffect(() => {
    setCanvas(initCanvas());
    setLeftBar(initLeftBar());
    setRightBar(initRightBar());
    setBall(initBall());

    if (canvas) {
      canvas.add(leftBar);
      canvas.add(rightBar);
      canvas.add(ball);
    }

    addEventListener("keydown", keyDownEvent);
    addEventListener("keyup", keyUpEvent)

    return (() => {
      removeEventListener("keydown", keyDownEvent);
      removeEventListener("keydown", keyUpEvent);
    })
  }, []);
  
  /*!
   * @brief 왼쪽 막대가 움직이는 경우 처리
   */
  useEffect(() => {
    if (canvas) {
      leftBar.set({top: leftY - 5});
      canvas.add(leftBar);
      canvas.add(rightBar);
      canvas.add(ball);
      canvas.renderAll();
    }
  }, [leftY]);
  
  /*!
   * @brief 오른 막대가 움직이는 경우 처리
   */
  useEffect(() => {
    if (canvas) {
      rightBar.set({top: rightY - 5});
      canvas.add(leftBar);
      canvas.add(rightBar);
      canvas.add(ball);
      canvas.renderAll();
    }
  }, [rightY]);

  return (
    <canvas id="myCanvas"></canvas>
  );
};

export default withRouter(GameRoomContent);