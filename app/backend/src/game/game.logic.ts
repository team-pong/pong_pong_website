import { Logger } from "@nestjs/common";
import { Socket, Server } from "socket.io";

export enum Scored {
    PLAYER00,
    PLAYER01,
    NONE
}

enum Edge {
    NONE,
    LEFT,
    RIGHT,
    TOP,
    BOTTOM
}

interface Obstacle {}
interface SquareObstacle extends Obstacle {
    obs00: [number, number, number, number],
    obs01: [number, number, number, number],
    obs02: [number, number, number, number],
    obs03: [number, number, number, number]
}

interface CircleObstacle extends Obstacle {
    obs00: [number, number, number],
    obs01: [number, number, number],
    obs02: [number, number, number],
    obs03: [number, number, number],
}

interface GameInfo {
    type: number,
    ball: [number, number],
    bar00: [number, number, number, number],
    bar01: [number, number, number, number],
    obstacle: Obstacle
}

export class GameLogic {
    _rightWall : number;
    _bottomWall : number;
    _direction : [number, number] = [0, 0] // 공의 진행 방향, 추후 속도를 적용할 수도 있음
    _ball : [number, number] = [0, 0] // ball의 중심 좌표, 반지름은 front와 협의하는걸로 설정함
    _bar00 : [number, number, number, number] = [0, 0, 0, 0]// 왼쪽 Bar의 좌표, 왼쪽 상단과 우측 하단 값
    _bar00_pre : number = 0
    _bar01 : [number, number, number,number] = [0, 0, 0, 0]// 우측 Bar의 좌표
    _bar01_pre : number = 0
    _speed : number;
    _correction : number;
    _server : Server;
    _iscollision : Boolean;
    _score : Scored = Scored.NONE;
    _leftBarMovement : NodeJS.Timeout;
    _rightBarMovement : NodeJS.Timeout;
    _type : number;
    _gameInfo : GameInfo;
    _speed_multiply : number = 1.07;

    constructor(
        width : number,
        height : number,
        init : number,
        server : Server) {
        this._bottomWall = height;
        this._rightWall = width;

        this._ball[0] = width / 2 // ballX
        this._ball[1] = height / 2 // ballY

        this._bar00[0] = 50 // left
        this._bar00[1] = height / 3 // top
        this._bar00[2] = 60 // left + width
        this._bar00[3] = (height / 3) * 2 // top + height

        this._bar01[0] = width - 60
        this._bar01[1] = height / 3
        this._bar01[2] = width - 50
        this._bar01[3] = (height / 3) * 2

        this._type = init;

        this._direction[0] = 1 / Math.SQRT2;
        this._direction[1] = 1 / Math.SQRT2;

        //console.log("direction abs = " + (this._direction[0] * this._direction[0] + this._direction[1] * this._direction[1]));
        this._speed = 3;
        this._correction = 0.1;
        this._server = server;
        this._iscollision = false;

        let obs : Obstacle = {}
        const center : [number, number] = [this._rightWall / 2, this._bottomWall / 2];
        if (init == 1) {
            const obstacle : SquareObstacle = {
                obs00: [(0 + center[0]) / 2 - 30, (0 + center[1]) / 2 - 30, (0 + center[0]) / 2 + 30, (0 + center[1]) / 2 + 30],
                obs01: [(0 + center[0]) / 2 - 30, (this._bottomWall + center[1]) / 2 - 30, (0 + center[0]) / 2 + 30, (this._bottomWall + center[1]) / 2 + 30],
                obs02: [(center[0] + this._rightWall) / 2 - 30, (0 + center[1]) / 2 - 30, (center[0] + this._rightWall) / 2 + 30, (0 + center[1]) / 2 + 30],
                obs03: [(center[0] + this._rightWall) / 2 - 30, (center[1] + this._bottomWall) / 2 - 30, (center[0] + this._rightWall) / 2 + 30, (center[1] + this._bottomWall) / 2 + 30]
            };
            obs = obstacle
        } else if (init == 2) {
            const obstacle : CircleObstacle = {
                obs00: [(0 + center[0]) / 2, (0 + center[1]) / 2, 30],
                obs01: [(0 + center[0]) / 2, (center[1] + this._bottomWall) / 2, 30],
                obs02: [(center[0] + this._rightWall) / 2, (0 + center[1]) / 2, 30],
                obs03: [(center[0] + this._rightWall) / 2, (center[1] + this._bottomWall) / 2, 30]
            }
            obs = obstacle
        }
        this._gameInfo = {
            ball: [width / 2, height / 2],
            bar00: [50, height / 3, 60, (height / 3) * 2],
            bar01: [width - 60, height / 3, width - 50, (height / 3) * 2],
            type: init,
            obstacle: obs
        }
    }

    // dir이 true라면 위로, false면 아래로
    // pos가 true라면 왼쪽(00), false면 오른쪽(01)
    moveBar(dir : boolean, pos : boolean) {
        if (pos) {
            //console.log("bar00 pre setting");
            this._bar00_pre = this._bar00[1];
        } else {
            this._bar01_pre = this._bar01[1];
        }
        const interval = setInterval(() => {
            let dirValue;
            if (dir) {
                dirValue = -5;
            } else {
                dirValue = 5;
            }
            if (pos) {
                if (this._bar00[1] + dirValue > 0 && this._bar00[3] + dirValue < this._bottomWall) {
                    this._bar00[1] += dirValue;
                    this._bar00[3] += dirValue;
                }
            } else {
                if (this._bar01[1] + dirValue > 0 && this._bar01[3] + dirValue < this._bottomWall) {
                    this._bar01[1] += dirValue;
                    this._bar01[3] += dirValue;
                }
            }
        }, 20);
        if (pos) {
            clearInterval(this._leftBarMovement);
            this._leftBarMovement = interval;
        } else {
            clearInterval(this._rightBarMovement);
            this._rightBarMovement = interval;
        }
    }

    rotate(angle : number) {
        const rad = angle * Math.PI / 180;
        this._direction[0] = this._direction[0] * Math.cos(rad) - this._direction[1] * Math.sin(rad);
        this._direction[1] = this._direction[0] * Math.sin(rad) + this._direction[1] * Math.cos(rad);
        const abs = Math.sqrt(this._direction[0] * this._direction[0] + this._direction[1] * this._direction[1]);
        this._direction[0] = this._direction[0] / abs;
        this._direction[1] = this._direction[1] / abs;
        //console.log("rotate abs: " + (this._direction[0] * this._direction[0] + this._direction[1] * this._direction[1]));
    }

    getJson() {
        return { bar00:this._bar00, bar01:this._bar01, ball:this._ball}
    }

    getObstacle() {
        if (this._type == 1) {
            const squares = this._gameInfo.obstacle as SquareObstacle
            return { obs00:squares.obs00, obs01:squares.obs01, obs02:squares.obs02, obs03:squares.obs03 };
        } else if (this._type == 2) {
            const circles = this._gameInfo.obstacle as CircleObstacle
            return { obs00:circles.obs00, obs01:circles.obs01, obs02:circles.obs02, obs03:circles.obs03 };
        } else {
            return {}
        }
    }

    getInitJson() {
        return { ball:this._ball, bar00:this._bar00, bar01:this._bar01, obstacle:this.getObstacle(), type:this._type }
    }

    initGame() {
        //console.log("init game");
        this._speed = 3;
        this._ball[0] = this._rightWall / 2 // ballX
        this._ball[1] = this._bottomWall / 2 // ballY

        this._bar00[0] = 50 // left
        this._bar00[1] = this._bottomWall / 3 // top
        this._bar00[2] = 60 // left + width
        this._bar00[3] = (this._bottomWall / 3) * 2 // top + this._bottomWall

        this._bar01[0] = this._rightWall - 60
        this._bar01[1] = this._bottomWall / 3
        this._bar01[2] = this._rightWall - 50
        this._bar01[3] = (this._bottomWall / 3) * 2

        // 서브 넣는 방향 조절 필요, 진 사람쪽 x방향으로 공 날리던가 하면 됨
        this._direction[0] = (1 / 1)
        this._direction[1] = (1 / 1)

        this._iscollision = false;
        this._score = Scored.NONE;
    }

    update() {
        // direction 방향으로 공을 이동
        const score = this.isScored(10);
        if (score != Scored.NONE) {
            this._score = score;
        } else {
            this.checkCollision(10)

            this._ball[0] += this._direction[0] * this._speed;
            this._ball[1] += this._direction[1] * this._speed;
        }
    }

    // parameter는 bar의 위치에 대한 값
    // point는 공의 한 지점
    checkBarInside(up: number, down: number, left: number, right: number, point : [number, number]) {
        if (point[1] >= up && (point[1] <= down) && (point[0] >= left) && (point[0] <= right)) {
            return true
        }
        return false
    }

    /*!
     * @brief 원과 원의 충돌 체크
                circle은 공의 좌표, col이 장애물의 좌표
     */
    isCollisionCC(circle : [number, number], radius : number, col : [number, number, number]) : Boolean {
        const distX = circle[0] - col[0];
        const distY = circle[1] - col[1];
        const distance = Math.sqrt((distX * distX) + (distY * distY));
        if (distance <= (radius + col[2])) {
            if (this._iscollision == false) {
                this._direction[0] *= -1;
                this._direction[1] *= -1;
                //console.log("collision circle");
                this._iscollision = true;
                this._speed *= this._speed_multiply;
            }
            return true;
        } else {
            return false;
        }
    }

    /*!
     * @brief 원과 사각형의 충돌 체크
                circle은 공의 좌표, square는 바 또는 장애물의 좌표
     */

    isCollisionSC(circle : [number, number], radius : number, square : [number, number, number, number], movingValue : number) : Boolean {
        let edgeX = circle[0];
        let edgeY = circle[1];
        const squareWidth = Math.abs(square[2] - square[0]);
        const squareHeight = (square[3] - square[1]);
        let horizonEdge = Edge.NONE;
        let verticalEdge = Edge.NONE;

        if (circle[0] < square[0]) {
            horizonEdge = Edge.LEFT;
            edgeX = square[0];   
        } else if (circle[0] >= (square[0] + squareWidth)) {
            horizonEdge = Edge.RIGHT;
            edgeX = square[0] + squareWidth;
        }
        if (circle[1] < square[1]) {
            verticalEdge = Edge.TOP;
            edgeY = square[1];
        } else if (circle[1] >= (square[1] + squareHeight)) {
            verticalEdge = Edge.BOTTOM;
            edgeY = square[1] + squareHeight;
        }

        const distX = circle[0] - edgeX;
        const distY = circle[1] - edgeY;
        const distance = Math.sqrt((distX * distX) + (distY * distY));

        if (distance <= radius) {
            if (this._iscollision == false) {
                this._iscollision = true;
                this._speed *= this._speed_multiply;
                if (horizonEdge != Edge.NONE) this._direction[0] *= -1;
                if (verticalEdge != Edge.NONE) {
                    if (verticalEdge == Edge.TOP && this._direction[1] < 0) {
                        //console.log("문제 있는 그 부분");
                    } else if (verticalEdge == Edge.BOTTOM && this._direction[1] > 0) {
                        //console.log("문제 있는 그 부분");
                    } else {
                        this._direction[1] *= -1;
                    }
                }
                this.rotate(movingValue * this._correction);
                //console.log("collision bar: " + horizonEdge + " " + verticalEdge);
            }
            return true;
        } else {
            return false;
        }
    }

    checkCollisionType(type : number) : Boolean {
        const center : [number, number] = [this._rightWall / 2, this._bottomWall / 2];
        if (type == 1) {
            // Square
            const squares = this._gameInfo.obstacle as SquareObstacle
            if (this.isCollisionSC(this._ball, 10, squares.obs00, 0)) {
                return true;
            } else if (this.isCollisionSC(this._ball, 10, squares.obs01, 0)) {
                return true;
            } else if (this.isCollisionSC(this._ball, 10, squares.obs02, 0)) {
                return true;
            } else if (this.isCollisionSC(this._ball, 10, squares.obs03, 0)) {
                return true;
            }
        } else if (type == 2) {
            // Circle
            const circles = this._gameInfo.obstacle as CircleObstacle
            if (this.isCollisionCC(this._ball, 10, circles.obs00)) {
                return true;
            } else if (this.isCollisionCC(this._ball, 10, circles.obs01)) {
                return true;
            } else if (this.isCollisionCC(this._ball, 10, circles.obs02)) {
                return true;
            } else if (this.isCollisionCC(this._ball, 10, circles.obs03)) {
                return true;
            }
        }
        return false;
    }

    checkCollision(radius : number) {
        const ballX = this._ball[0] + this._direction[0] * this._speed;
        const ballY = this._ball[1] + this._direction[1] * this._speed;
        const up = ballY - radius;
        const down = ballY + radius;
        const left = ballX - radius;
        const right = ballX + radius;

        if (up <= 0) {
            // direction 전환
            this._direction[1] *= -1;
        } else if (down >= this._bottomWall) {
            // direction 전환
            this._direction[1] *= -1;
        } else if (this.isCollisionSC(this._ball, 10, this._bar00, this._bar00_pre - this._bar00[1])) {
            //console.log("collision bar00");
            // bar의 움직임에 따라 방향 값 회전
            //console.log("bar : " + this._bar00[1]);
            //console.log('bar pre: ' + this._bar00_pre);
            //console.log("bar movement: " + movingValue);
            //console.log("rotate: " + (movingValue * this._correction));
        } else if (this.isCollisionSC(this._ball, 10, this._bar01, this._bar01_pre - this._bar01[1])) {
            //console.log("collision bar01");
            // bar의 움직임에 따라 방향 값 회전
            //console.log("bar movement: " + movingValue);
            //console.log("rotate: " + (movingValue * this._correction));
        } else if (this.checkCollisionType(this._type)) {
            //console.log("collision brick");
        } else {
            this._iscollision = false;
        }
    }

    isScored(radius : number) {
        if (this._ball[0] + radius >= this._rightWall) {
            return Scored.PLAYER00
        }
        if (this._ball[0] - radius <= 0) {
            return Scored.PLAYER01
        }
        return Scored.NONE
    }
}