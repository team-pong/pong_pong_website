import { FC, useEffect, useState } from "react";
import CircleChart from "../../circlechart/CircleChart";
import "../../../scss/content/RecordContent.scss";
import EasyFetch from "../../../utils/EasyFetch";

interface matchLog {
  user_score: number,
  other_score: number,
  isWin: boolean,
  user_url: string,
  user_nick: string,
  other_url: string,
  other_nick: string,
  createdAt: string,
  type: string,
  map: number
}

/*!
 * @author yochoi
 * @brief 전적 검색 후 <li>로 감싸 반환하는 컴포넌트
 * @param[in] target 전적을 검색하려는 유저의 nickname
 * @param[in] type 검색하려는 게임의 타입(e.g. 전체, 일반, 레더)
 */

const RecordList: FC<{target: string, type: string}> = ({ target, type }): JSX.Element => {

  const [matchList, setMatchList] = useState<matchLog[]>([]);

  const getRecord = async () => {
    let apiAddress: string = "";
    switch (type) {
      case "normal":
        apiAddress = `http://127.0.0.1:3001/match/general?nick=${target}`
        break;
      case "ladder":
        apiAddress = `http://127.0.0.1:3001/match/ranked?nick=${target}`
        break;
      default:
        apiAddress = `http://127.0.0.1:3001/match?nick=${target}`
        break;
    };
    const easyfetch = new EasyFetch(apiAddress);
    const res = await (await easyfetch.fetch()).json();
    setMatchList(res.matchList);
  };

  useEffect(() => {
    getRecord();
  }, [target, type]);

  return (
    <ul id="record-list">
      {matchList.map((log, i) => {
        return (
          <div id="log" key={i} style={log.isWin ? {backgroundColor: "#62C375"} : {backgroundColor: "#CE4D36"}}>
            <span id="player">
              <img src={`https://cdn.intra.42.fr/users/medium_yochoi.png`/*log.user_url*/} alt={`${log.user_nick}'s img`}/>
              {' '}
              {log.user_nick}
              {' '}
              <img src={`./public/number/${log.other_score}.svg`} alt={`${log.user_score}`} style={{borderRadius: "0"}}/>
            </span>
            <img src="./public/vs.svg"/>
            <span id="player">
              <img src={`./public/number/${log.other_score}.svg`} alt={`${log.other_score}`} style={{borderRadius: "0"}}/>
              {' '}
              {log.other_nick}
              {' '}
              <img src={`https://cdn.intra.42.fr/users/medium_jinbkim.jpg`/*log.other_url*/} alt={`${log.other_nick}'s img`}/>
            </span>
            <span id="game-info">
              <div>15분전</div>
              <div>{log.type === "general" ? <>일반</> : <>레더</>}</div>
              <div>{`맵${log.map}`}</div>
            </span>
          </div>
        );
      })}
    </ul>
  );
}

/*!
 * @author yochoi
 * @brief 유저 정보를 저장하는 인터페이스
 */

interface userInfo {
  nick: string,
  avatar_url: string,
  total_games: number,
  win_games: number,
  loss_games: number,
  winning_rate: number,
  ladder_level: number
}

/*!
 * @author yochoi
 * @brief 통계 및 전적을 보여주는 컴포넌트
 */

const Record: FC<{stats: userInfo}> = ({stats: {nick, avatar_url, total_games, win_games, loss_games, ladder_level}}) => {

  const [recordSelector, setRecordSelector] = useState("all");

  return (
    <div id="record">
      <div id="stats">
        <span id="profile">
          <img src={`https://cdn.intra.42.fr/users/medium_yochoi.png`} alt={`${nick}'s img`}/>
          <span>{nick}   </span>
        </span>
        <CircleChart width={100} height={100} percentage={(win_games / total_games) * 100} />
        <span>{total_games}전 {win_games}승 {loss_games}패 {ladder_level}점</span>
      </div>
      <ul id="record-selector">
        <li onClick={() => setRecordSelector("all")}>
            <input type="radio" name="all" checked={recordSelector === "all"} onChange={() => {}}/>
            <label>전체</label>
        </li>
        <li onClick={() => setRecordSelector("normal")}>
            <input type="radio" name="normal" checked={recordSelector === "normal"} onChange={() => {}}/>
            <label>일반</label>
        </li>
        <li onClick={() => setRecordSelector("ladder")}>
            <input type="radio" name="ladder" checked={recordSelector === "ladder"} onChange={() => {}}/>
            <label>레더</label>
        </li>
      </ul>
      <RecordList target={nick} type={recordSelector}/>
    </div>
  )
}

/*!
 * @author yochoi
 * @brief 검색, 전적을 보여주는 컴포넌트
 */

enum recordState {
  open,
  close,
  noResult
}

const RecordContent: FC = (): JSX.Element => {

  const [nickNameToFind, setNickNameToFind] = useState("");
  const [isRecordOpen, setIsRecordOpen] = useState(recordState.close);
  const [stats, setStats] = useState<userInfo>({
    nick: "",
    avatar_url: "",
    total_games: 0,
    win_games: 0,
    loss_games: 0,
    winning_rate: 0,
    ladder_level: 0
  });

  const search = async () => {
    if (nickNameToFind) {
      const easyfetch = new EasyFetch(`http://127.0.0.1:3001/users?nick=${nickNameToFind}`);
      const res = await (await easyfetch.fetch()).json();
      if (res.err_msg) {
        setIsRecordOpen(recordState.noResult);
        return ;
      }
      setStats({
        nick: res.nick,
        avatar_url: res.avatar_url,
        total_games: res.total_games,
        win_games: res.win_games,
        loss_games: res.loss_games,
        winning_rate: (res.win_games / res.total_games) * 100,
        ladder_level: res.ladder_level
      });
      setIsRecordOpen(recordState.open);
    } else {
      setIsRecordOpen(recordState.close);
    }
  }

  return (
    <div id="record-content">
      <div id="search">
        <input
          type="text"
          placeholder="전적 검색을 하려는 닉네임을 입력해 주세요"
          value={nickNameToFind}
          spellCheck={false}
          onChange={({target: {value}}) => setNickNameToFind(value)} 
          onKeyDown={(e) => {if (e.key === "Enter") search()}} />
        <button onClick={search}><img src="./public/search.svg" alt="검색"/></button>
      </div>
      {isRecordOpen === recordState.open && <Record stats={stats}/>}
      {
        isRecordOpen === recordState.close &&
        <div id="record-closed">
          <div id="most-played-map"></div>
          <div id="worst-played-map"></div>
          <div id="ladder-rank"></div>
        </div>
      }
      {
        isRecordOpen === recordState.noResult &&
        <div id="no-result">
          <img src="./public/exclamation-mark.svg" alt="Exclamation mark" />
          <span>검색 결과가 없습니다</span>
        </div>
      }
    </div>
  );
}

export default RecordContent;