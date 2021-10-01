/*!
 * @author yochoi
 * @brief 시간을 파싱하고, 상대시간 (e.g. 15분전 )도 계산해주는 미친 클래스
 * @details
 *          1. const date = new Time("2021-07-31T05:41:48.342Z");
 *              -> 시간 형식은 Date 객체가 허용하는 한 사용 가능함
 *          2. console.log(date.month)
 *              -> 출력 예상: 7
 *          3. console.log(date.getRelativeTime())
 *              -> 출력 예상: 3 달 전 (사용 시점에 따라 달라짐)
 * @warings
 *          getRelativeTime 메소드는 Time 클래스를 선언할 때 사용한 시간이 과거여만 함
 *          미래의 시간을 넣을 시 Undefined Behavior
*/

export default class Time {
  private _localDate: string;
  private _localTime: string;

  readonly year: string;
  readonly month: string;
  readonly date: string;
  readonly hour: string;
  readonly minuate: string;
  readonly seconds: string;

  constructor(time: string) {
    const date = new Date(time);
    let parseDate: string[];
    let parseTime: string[];

    this._localDate = date.toLocaleDateString();
    this._localTime = date.toLocaleTimeString();

    /*!
     * @author yochoi
     * @brief parsing date
     */
  
    parseDate = this._localDate.split(".");
    this.year = parseDate[0].trim();
    this.month = parseDate[1].trim();
    this.date = parseDate[2].trim();

    /*!
     * @author yochoi
     * @brief parsing time
     */

    parseTime = this._localTime.substr(3).split(":");
    this.hour = parseTime[0];
    this.minuate = parseTime[1];
    this.seconds = parseTime[2];
  }

  getRelativeTime(): string {
    const currentTime = new Time(new Date().toString());
    console.log("과거: " + this.month);
    console.log("현재: " + currentTime.month);
    if ((+currentTime.year - +this.year) >= 1) {
      return (`${+currentTime.year - +this.year} 년 전`);
    } else if ((+currentTime.month - +this.month) >= 1) {
      return (`${+currentTime.month - +this.month} 달 전`);
    } else if ((+currentTime.hour - +this.hour) >= 1) {
      return (`${+currentTime.hour - +this.hour} 시간 전`);
    } else if ((+currentTime.minuate - +this.minuate) >= 1) {
      return (`${+currentTime.minuate - +this.minuate} 분 전`);
    }
    return ("지금");
  }
}