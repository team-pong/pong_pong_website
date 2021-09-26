import { Logger } from "@nestjs/common";
import { Socket, Server } from "socket.io";

enum Scored {
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
    _bar00_pre : [number, number, number, number];
    _bar01 : [number, number, number,number] = [0, 0, 0, 0]// 우측 Bar의 좌표
    _bar01_pre : [number, number, number, number];
    _speed : number;
    _correction : number;
    _server : Server;

    constructor(
        width : number,
        height : number,
        init : number,
        server : Server) {
        this._bottomWall = height;
        this._rightWall = width;

        this._ball[0] = width / 2
        this._ball[1] = height / 2

        this._bar00[0] = 100
        this._bar00[1] = height / 3
        this._bar00[2] = 150
        this._bar00[3] = (height / 3) * 2

        this._bar01[0] = width - 150
        this._bar01[1] = height / 3
        this._bar01[2] = width - 100
        this._bar01[3] = (height / 3) * 2

        this._direction[0] = (init / init)
        this._direction[1] = (init / init)

        this._speed = 3;
        this._correction = 0.1;
        this._server = server;
    }

    // dir이 true라면 위로, false면 아래로
    // pos가 true라면 왼쪽(00), false면 오른쪽(01)
    moveBar(dir : boolean, pos : boolean) {
        let dirValue;
        if (dir) {
            dirValue = -5;
        } else {
            dirValue = 5;
        }
        if (pos) {
            this._bar00_pre = this._bar00;
            if (this._bar00[1] + dirValue > 0 || this._bar00[3] + dirValue < this._bottomWall) {
                this._bar00[1] += dirValue;
                this._bar00[3] += dirValue;
            }
        } else {
            this._bar01_pre = this._bar01;
            if (this._bar01[1] + dirValue > 0 || this._bar01[3] + dirValue < this._bottomWall) {
                this._bar01[1] += dirValue;
                this._bar01[3] += dirValue;
            }
        }
    }

    rotate(angle : number) {
        this._direction[0] = this._direction[0] * Math.cos(angle) - this._direction[1] * Math.sin(angle);
        this._direction[1] = this._direction[0] * Math.sin(angle) + this._direction[1] * Math.cos(angle);
    }

    getJson() {
        return { bar00:this._bar00, bar01:this._bar01, ball:this._ball}
    }

    update() {
        // direction 방향으로 공을 이동
        this._ball[0] += this._direction[0] * this._speed;
        this._ball[1] += this._direction[1] * this._speed;
        this.checkCollision(10)
        if (this.isScored(10) != Scored.NONE) {
            Logger.log("score!")
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
        const up = this._ball[1] - radius;
        const down = this._ball[1] + radius;
        const left = this._ball[0] - radius;
        const right = this._ball[0] + radius;

        if (up <= 0) {
            // direction 전환
            this._direction[1] *= -1
        }
        if (down >= this._bottomWall) {
            // direction 전환
            this._direction[1] *= -1
        }
        // 추후 제거 필요
        if (left <= 0) {
            this._direction[0] *= -1;
        }
        if (right >= this._rightWall) {
            this._direction[0] *= -1;
        }
        // 여기까지

        // bar 0 = 좌측 상단의 x, 1 = y, 2 = 우측 하단의 x, 3 = y
        if (this.checkBarInside(this._bar00[1], this._bar00[3], this._bar00[0], this._bar00[2], [this._ball[0], up])) {
            this._direction[1] *= -1
        }
        if (this.checkBarInside(this._bar00[1], this._bar00[3], this._bar00[0], this._bar00[2], [this._ball[0], down])) {
            this._direction[1] *= -1
        }
        // Bar의 좌측/우측(이전 위치에 따라 보정 적용)
        if (this.checkBarInside(this._bar00[1], this._bar00[3], this._bar00[0], this._bar00[2], [left, this._ball[1]])) {
            const diff = (this._bar00[1] - this._bar00_pre[1]) * this._correction;
            this._direction[0] *= -1;
            if (diff > 0) {
                // 아래쪽 이동
                this.rotate(-diff);
            } else {
                this.rotate(diff);
            }
        }
        if (this.checkBarInside(this._bar00[1], this._bar00[3], this._bar00[0], this._bar00[2], [right, this._ball[1]])) {
            this._direction[0] *= -1
            const diff = (this._bar00[1] - this._bar00_pre[1]) * this._correction;
            this._direction[0] *= -1;
            if (diff > 0) {
                // 아래쪽 이동
                this.rotate(diff);
            } else {
                this.rotate(-diff);
            }
        }

        if (this.checkBarInside(this._bar01[1], this._bar01[3], this._bar01[0], this._bar01[2], [this._ball[0], up])) {
            this._direction[1] *= -1
        }
        if (this.checkBarInside(this._bar01[1], this._bar01[3], this._bar01[0], this._bar01[2], [this._ball[0], down])) {
            this._direction[1] *= -1
        }
        if (this.checkBarInside(this._bar01[1], this._bar01[3], this._bar01[0], this._bar01[2], [left, this._ball[1]])) {
            this._direction[0] *= -1
            const diff = (this._bar00[1] - this._bar00_pre[1]) * this._correction;
            this._direction[0] *= -1;
            if (diff > 0) {
                // 아래쪽 이동
                this.rotate(-diff);
            } else {
                this.rotate(diff);
            }
        }
        if (this.checkBarInside(this._bar01[1], this._bar01[3], this._bar01[0], this._bar01[2], [right, this._ball[1]])) {
            this._direction[0] *= -1
            const diff = (this._bar00[1] - this._bar00_pre[1]) * this._correction;
            this._direction[0] *= -1;
            if (diff > 0) {
                // 아래쪽 이동
                this.rotate(diff);
            } else {
                this.rotate(-diff);
            }
        }
    }

    isScored(radius : number) {
        if (this._ball[0] + radius >= this._rightWall) {
            return Scored.PLAYER01
        }
        if (this._ball[0] - radius <= 0) {
            return Scored.PLAYER00
        }
        return Scored.NONE
    }
}