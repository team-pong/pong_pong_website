/*!
 * @author yochoi
 * @brief 시간을 파싱하고, 상대시간 (e.g. 15분전 )도 계산해주는 미친 클래스
 * @details
 *          1. const date = new Time("2021-07-31T05:41:48.342Z");
 *              -> 시간 형식은 Date 객체가 허용하는 한 사용 가능함
 *          2. //console.log(date.getMonth())
 *              -> 출력 예상: 7
 *          3. //console.log(date.getRelativeTime())
 *              -> 출력 예상: 3 달 전 (사용 시점에 따라 달라짐)
 * @warings
 *          getRelativeTime 메소드는 Time 클래스를 선언할 때 사용한 시간이 과거여만 함
 *          미래의 시간을 넣을 시 Undefined Behavior
*/

export default class Time {
  private _localDate: string;
  private _localTime: string;

  private _year: string;
  private _month: string;
  private _date: string;
  private _timeFormat: string;
  private _hour: string;
  private _minuate: string;
  private _seconds: string;

  private parseToLocal(time: string) {
    const date = new Date(time);
    this._localDate = date.toLocaleDateString('ko-KR');
    this._localTime = date.toLocaleTimeString('ko-KR');
  }

  private parseDate() {
    const parse_date = this._localDate.split(".");
    this._year = parse_date[0].trim();
    this._month = parse_date[1].trim();
    this._date = parse_date[2].trim();
  }

  private parseTime() {
    const parseTime = this._localTime.substr(3).split(":");
    this._timeFormat = this._localTime.substr(0, 2);
    this._hour = parseTime[0];
    this._minuate = parseTime[1];
    this._seconds = parseTime[2];
  }

  public constructor(time: string) {
    this.parseToLocal(time);
    this.parseDate();
    this.parseTime();
  }

  public setTime(time: string) {
    this.parseToLocal(time);
    this.parseDate();
    this.parseTime();
  }

  public getRelativeTime(): string {
    const currentTime = new Time(new Date().toString());

    if ((+currentTime._year - +this._year) >= 1) {
      return (`${+currentTime._year - +this._year}년 전`);
    } else if ((+currentTime._month - +this._month) >= 1) {
      return (`${+currentTime._month - +this._month}달 전`);
    } else if ((+currentTime._hour - +this._hour) >= 1) {
      return (`${+currentTime._hour - +this._hour}시간 전`);
    } else if ((+currentTime._minuate - +this._minuate) >= 1) {
      return (`${+currentTime._minuate - +this._minuate}분 전`);
    }
    return ("조금 전");
  }

  public getYear() {
    return (this._year);
  }

  public getMonth() {
    return (this._month);
  }

  public getDate() {
    return (this._date);
  }

  public getTimeFormat() {
    return (this._timeFormat);
  }

  public getHour() {
    return (this._hour);
  }

  public getMinuate() {
    return (this._minuate);
  }

  public getSeconds() {
    return (this._seconds);
  }

  public getWholeTime() {
    return (`${this._year}년 ${this._month}월 ${this._date}일 ${this._hour}시 ${this._minuate}분`);
  }
}