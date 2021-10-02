import { Logger } from "@nestjs/common";
import { Socket, Server } from "socket.io";

export enum Scored {
    PLAYER00,
    PLAYER01,
    NONE
}

export class GameLogic {
    _rightWall : number;
    _bottomWall : number;
    _direction : [number, number] = [0, 0] // 공의 진행 방향, 추후 속도를 적용할 수도 있음
    _ball : [number, number] = [0, 0] // ball의 중심 좌표, 반지름은 front와 협의하는걸로 설정함
    _bar00 : [number, number, number, number] = [0, 0, 0, 0]// 왼쪽 Bar의 좌표, 왼쪽 상단과 우측 하단 값
    _bar00_pre : [number, number, number, number] = [0, 0, 0, 0];
    _bar01 : [number, number, number,number] = [0, 0, 0, 0]// 우측 Bar의 좌표
    _bar01_pre : [number, number, number, number] = [0, 0, 0, 0];
    _speed : number;
    _correction : number;
    _server : Server;
    _iscollision : Boolean;
    _score : Scored = Scored.NONE;
    _leftBarMovement : NodeJS.Timeout;
    _rightBarMovement : NodeJS.Timeout;

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

        this._direction[0] = (init / init)
        this._direction[1] = (init / init)

        this._speed = 3;
        this._correction = 0.1;
        this._server = server;
        this._iscollision = false;
    }

    // dir이 true라면 위로, false면 아래로
    // pos가 true라면 왼쪽(00), false면 오른쪽(01)
    moveBar(dir : boolean, pos : boolean) {
        const interval = setInterval(() => {
            let dirValue;
            if (dir) {
                dirValue = -5;
            } else {
                dirValue = 5;
            }
            if (pos) {
                this._bar00_pre = this._bar00;
                if (this._bar00[1] + dirValue > 0 && this._bar00[3] + dirValue < this._bottomWall) {
                    this._bar00[1] += dirValue;
                    this._bar00[3] += dirValue;
                }
            } else {
                this._bar01_pre = this._bar01;
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
        this._direction[0] = this._direction[0] * Math.cos(angle) - this._direction[1] * Math.sin(angle);
        this._direction[1] = this._direction[0] * Math.sin(angle) + this._direction[1] * Math.cos(angle);
    }

    getJson() {
        return { bar00:this._bar00, bar01:this._bar01, ball:this._ball}
    }

    initGame() {
        console.log("init game");
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
        } else if (this.checkBarInside(this._bar00[1], this._bar00[3], this._bar00[0], this._bar00[2], [ballX, up])) { // bar 0 = 좌측 상단의 x, 1 = y, 2 = 우측 하단의 x, 3 = y
            if (this._iscollision == false) {
                this._direction[1] *= -1
                this._iscollision = true;
            }
        } else if (this.checkBarInside(this._bar00[1], this._bar00[3], this._bar00[0], this._bar00[2], [ballX, down])) {
            if (this._iscollision == false) {
                this._direction[1] *= -1
                this._iscollision = true;
            }
        } else if (this.checkBarInside(this._bar00[1], this._bar00[3], this._bar00[0], this._bar00[2], [left, ballY])) {
            if (this._iscollision == false) {
                this._direction[0] *= -1;
                this._iscollision = true;
            }
        } else if (this.checkBarInside(this._bar00[1], this._bar00[3], this._bar00[0], this._bar00[2], [right, ballY])) {
            if (this._iscollision == false) {
                this._direction[0] *= -1;
                this._iscollision = true;
            }
        } else if (this.checkBarInside(this._bar01[1], this._bar01[3], this._bar01[0], this._bar01[2], [ballX, up])) {
            if (this._iscollision == false) {
                this._direction[1] *= -1;
                this._iscollision = true;
            }
        } else if (this.checkBarInside(this._bar01[1], this._bar01[3], this._bar01[0], this._bar01[2], [ballX, down])) {
            if (this._iscollision == false) {
                this._direction[1] *= -1;
                this._iscollision = true;
            }
        } else if (this.checkBarInside(this._bar01[1], this._bar01[3], this._bar01[0], this._bar01[2], [left, ballY])) {
            if (this._iscollision == false) {
                this._direction[0] *= -1;
                this._iscollision = true;
            }
        } else if (this.checkBarInside(this._bar01[1], this._bar01[3], this._bar01[0], this._bar01[2], [right, ballY])) {
            if (this._iscollision == false) {
                this._direction[0] *= -1;
                this._iscollision = true;
            }
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