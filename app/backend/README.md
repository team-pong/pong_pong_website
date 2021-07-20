
# Database 구조
<details>
<summary>펼치기</summary>
<div markdown="1">

users
|user_id|nick|avatar_url|
|-----|---|---|
||||

achievements
|user_id|achievement|
|-----|---|
|||

match
|winner_id|loser_id|type|
|-----|---|---|
|||

chat
|channel_id|owner_id|type|passwd|
|-----|---|---|---|

stat
|user_id|games|win|lose|ladder_level|
|-----|---|---|---|---|

ban
|channel_id|user_id|
|-----|---|

admin
|channel_id|user_id|
|-----|---|

mute
|channel_id|user_id|
|-----|---|

friend
|user_id|friend_id|status|
|-----|---|---|

</div>
</details>

# Backend API

## 유저 정보
|url|method|description|request|response|
|------|---|---|----|----|
|/api/oauth|POST|유저 로그인|`{code: string}`|empty|
|/users/info|GET|유저 조회|empty|`{user_id: string, nickname: string, avatar_url: string}`|
|/users/info|POST|유저 수정|`{user_id: string, nickname: string, avatar_url: string}`|empty|
|/users/info|DELETE|유저 제거|empty|`{user_id: string, nickname: string, avatar_url: string}`|

## 세션 검증
|url|method|description|request|response|
|------|---|---|----|----|
|/auth/valid|GET|세션 검증|`cookie: {connect.sid: string}`|`{response: "ok" \| "invalid"}`|

<details>
<summary>구현 예정</summary>
<div markdown="1">

## 친구 
|url|method|description|request|response|
|------|---|---|----|----|
|/users/friends|GET|친구 조회|empty|`[{friend_id: string, status: online \| offline \| in_game}, ...]`|
|/users/friends|POST|친구 추가|`{friend_id: string}`|empty|
|/users/friends|DELETE|친구 제거|`{friend_id: string}`|empty|

## 채팅
|url|method|description|request|response|
|------|---|---|----|----|
|/chat/join|GET|채팅 참여|`{channel_id: string}`||
|/chat/ban|GET|밴 목록 조회|`{channel_id: string}`|`[user_id, ...]`|
|/chat/ban|POST|밴 추가|`{channel_id: string, user_id: string}`||


## 게임
|url|method|description|request|response|
|------|---|---|----|----|
|/users/history|GET|전적 조회|empty|`{user_id: string, total: number, win: number, lose: number, ladder_lebel: number}`|

</div>
</details>