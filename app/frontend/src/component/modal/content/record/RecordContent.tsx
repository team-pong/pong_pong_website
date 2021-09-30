import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import CircleChart from "../../../chart/CircleChart";
import BarChart from "../../../chart/BarChart";
import "/src/scss/content/RecordContent.scss";
import EasyFetch from "../../../../utils/EasyFetch";
import ladderRank from '../../../../dummydata/testLadderRank';

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
        apiAddress = `${global.BE_HOST}/match/general?nick=${target}`
        break;
      case "ladder":
        apiAddress = `${global.BE_HOST}/match/ranked?nick=${target}`
        break;
      default:
        apiAddress = `${global.BE_HOST}/match?nick=${target}`
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
            <span className="player">
              <img  className="record-player-img" src={log.user_url} alt={`${log.user_nick}'s img`}/>
              {' '}
              {log.user_nick}
              {' '}
              <img src={`/public/number/${log.other_score}.svg`} alt={`${log.user_score}`} style={{borderRadius: "0"}}/>
            </span>
            <img className="record-list-vs" src="/public/vs.svg"/>
            <span className="player">
              <img src={`/public/number/${log.other_score}.svg`} alt={`${log.other_score}`} style={{borderRadius: "0"}}/>
              {' '}
              {log.other_nick}
              {' '}
              <img  className="record-player-img" src={log.other_url} alt={`${log.other_nick}'s img`}/>
            </span>
            <span id="game-info">
              <div className="game-info-div">15분전</div>
              <div className="game-info-div">{log.type === "general" ? <>일반</> : <>레더</>}</div>
              <div className="game-info-div">{`맵${log.map}`}</div>
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

const RecordOpen: FC<{
  stats: userInfo,
  setIsRecordOpen: Dispatch<SetStateAction<number>>
}> = ({stats: {nick, avatar_url, total_games, win_games, loss_games, ladder_level}, setIsRecordOpen}) => {

  const [recordSelector, setRecordSelector] = useState("all");

  return (
    <div id="record-open">
      <img src="/public/arrow.svg" className="arrow-button" onClick={() => setIsRecordOpen(1)}/>
      <div id="stats">
        <span id="profile">
          <img className="record-pro-img" src={avatar_url} alt={`${nick}'s img`}/>
          <span className="record-profile-nick">{nick}   </span>
        </span>
        <CircleChart width={100} height={100} percentage={Math.floor((win_games / total_games) * 100)} />
        <span className="record-stat-span">{total_games}전 {win_games}승 {loss_games}패 {ladder_level}점</span>
      </div>
      <ul id="record-selector">
        <li className="record-selector-li" onClick={() => setRecordSelector("all")}>
            <input className="record-selector-input" type="radio" name="all" checked={recordSelector === "all"} onChange={() => {}}/>
            <label>전체</label>
        </li>
        <li className="record-selector-li" onClick={() => setRecordSelector("normal")}>
            <input className="record-selector-input" type="radio" name="normal" checked={recordSelector === "normal"} onChange={() => {}}/>
            <label>일반</label>
        </li>
        <li className="record-selector-li" onClick={() => setRecordSelector("ladder")}>
            <input className="record-selector-input" type="radio" name="ladder" checked={recordSelector === "ladder"} onChange={() => {}}/>
            <label>레더</label>
        </li>
      </ul>
      <RecordList target={nick} type={recordSelector}/>
    </div>
  )
}

const RecordClose: FC = (): JSX.Element => {
  return (
    <div id="record-close">
      <div className="message">
        <div className="you-know-that">알고계셨나요?</div>
        <span className="content"></span>
      </div>
      <div className="message">
        <div className="you-know-that">알고계셨나요?</div>
        <span className="content"></span>
      </div>
      <div className="message">
        <div className="you-know-that">알고계셨나요?</div>
        <span className="content"></span>
      </div>
      <ul id="ladder-rank">
        {
          ladderRank.rank.map((user, i) => {
            return (
              <li className="record-ladder-li" key={i}>
                <img className="record-ladder-img" src={user.avatar_url}/>
                <span id="nick">{user.nick}</span>
                <BarChart left={user.win} right={user.loss} />
                <span id="percentage">{Math.floor((user.win / (user.win + user.loss)) * 100)}%</span>
              </li>
            );
          })
        }
      </ul>
    </div>
  );
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

const RecordContent: FC<{nick?: string}> = ({nick}): JSX.Element => {

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

  const search = async (nick?: string) => {
    if (nickNameToFind || nick) {
      let easyfetch = null;
      if (nick) {
        easyfetch = new EasyFetch(`${global.BE_HOST}/users?nick=${nick}`);  
      } else {
        easyfetch = new EasyFetch(`${global.BE_HOST}/users?nick=${nickNameToFind}`);
      }
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

  /*!
   * @author donglee
   * @brief props로 nick이 있으면 프로필에서 열람 한 것이므로 바로 검색을 실행한다
   */
  useEffect(() => {
    if (nick) {
      setNickNameToFind(nick);
      search(nick);
    }
  }, []);

  return (
    <div id="record-content">
      <div id="search">
        <input
          className="record-search-input"
          type="text"
          placeholder="전적 검색을 하려는 닉네임을 입력해 주세요"
          value={nickNameToFind}
          spellCheck={false}
          onChange={({target: {value}}) => setNickNameToFind(value)} 
          onKeyDown={(e) => {if (e.key === "Enter") search()}} /><span className="input-border" />
        <button className="record-search-btn" onClick={() => search()}><img className="record-search-img" src="/public/search.svg" alt="검색"/></button>
      </div>
      {isRecordOpen === recordState.open && <RecordOpen stats={stats} setIsRecordOpen={setIsRecordOpen}/>}
      {isRecordOpen === recordState.close && <RecordClose />}
      {
        isRecordOpen === recordState.noResult &&
        <div id="no-result">
          <img src="/public/arrow.svg" className="arrow-button" onClick={() => setIsRecordOpen(recordState.close)}/>
          <img src="/public/exclamation-mark.svg" id="no-result-img" alt="Exclamation mark" />
          <span className="record-no-result-span">검색 결과가 없습니다</span>
        </div>
      }
    </div>
  );
}

export default RecordContent;