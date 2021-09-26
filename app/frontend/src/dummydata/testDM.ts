const testAvatarUrl = "https://gravatar.com/avatar/d93441b9901723e7ec67159e63c4f995?s=400&d=robohash&r=x";

interface User {
  avatar_url: string,   /* e.g.) "/img/avatar.img"           */
  nick: string          /* e.g.) "asdf"                     */
}

export interface DM {
  target: User,         /* avatar_url, nick 등이 들어있는 객체 */
  lastMsg: string,      /* e.g.) "안녕"                    */
  lastMsgTime: string   /* e.g.) "15분전"                 */
}

export const testDMList: DM[] = [
  {
    target: {
      avatar_url: testAvatarUrl,
      nick: "hna"
    },
    lastMsg: "뭐해",
    lastMsgTime: "15분전"
  }, {
    target: {
      avatar_url: testAvatarUrl,
      nick: "donglee"
    },
    lastMsg: "안녕",
    lastMsgTime: "30분전"
  }, {
    target: {
      avatar_url: testAvatarUrl,
      nick: "jinwkim"
    },
    lastMsg: "hello",
    lastMsgTime: "45분전"
  }, {
    target: {
      avatar_url: testAvatarUrl,
      nick: "엄청긴줄 테스터"
    },
    lastMsg: "엄청긴줄 12345678910 abcdefghijk",
    lastMsgTime: "어제"
  }
]

export interface DMLog {
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