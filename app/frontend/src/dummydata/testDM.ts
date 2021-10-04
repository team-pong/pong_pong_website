interface DMLog {
  time: string,         /* e.g.) "오후 1:42"     */
  msg: string,          /* e.g.) "반갑다"        */
  from: string          /* e.g.) "me" || "hna" */
};

export const testDMLog: DMLog[] = [
  {
    time: "오후 3:05",
    msg: "이건 가장 최근 메세지",
    from: "jinwkim"
  }, {
    time: "오전 8:10",
    msg: "asdf 안녕",
    from: "me"
  }, {
    time: "오전 8:08",
    msg: "안녕",
    from: "me"
  }, {
    time: "오전 8:08",
    msg: "그려",
    from: "jinwkim"
  }, {
    time: "오전 8:08",
    msg: "ㄴㅁㄹ",
    from: "jinwkim"
  }, {
    time: "오전 8:08",
    msg: "ㄹㄹㄹ",
    from: "me"
  }, {
    time: "오전 8:08",
    msg: "ㄴㄴ",
    from: "me"
  }, {
    time: "오전 8:08",
    msg: "뮬ㅊㄱㄷㅈ",
    from: "jinwkim"
  }, {
    time: "오전 8:08",
    msg: "ㅠㅑㅓㅐㅓ",
    from: "jinwkim"
  }, {
    time: "오전 8:00",
    msg: "이건 가장 오래된 메세지",
    from: "jinwkim"
  }
];