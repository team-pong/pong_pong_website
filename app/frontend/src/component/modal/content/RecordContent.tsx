import { FC, useState } from "react";
import CircleChart from "../../circlechart/CircleChart";
import "../../../scss/content/RecordContent.scss";
import EasyFetch from "../../../utils/EasyFetch";

interface statistics {
  total_games: number,
  win_games: number,
  loss_games: number,
  winning_rate: number,
  ladder_level: number
}

const Record: FC<{stats: statistics}> = ({stats: {total_games, win_games, loss_games, ladder_level}}) => {
  return (
    <div id="record">
      <div id="stats">
        <CircleChart width={100} height={100} percentage={(win_games / total_games) * 100} />
        <span>{total_games}전 {win_games}승 {loss_games}패 {ladder_level}점</span>
      </div>
    </div>
  )
}

const RecordContent: FC = (): JSX.Element => {

  const [nickNameToFind, setNickNameToFind] = useState("");
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [stats, setStats] = useState<statistics>({
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
        setIsRecordOpen(false);
        return ;
      }
      setStats({
        total_games: res.total_games,
        win_games: res.win_games,
        loss_games: res.loss_games,
        winning_rate: (res.win_games / res.total_games) * 100,
        ladder_level: res.ladder_level
      });
      setIsRecordOpen(true);
    }
  }

  return (
    <div id="record-content">
      <div id="search">
        <input
          type="text"
          placeholder="닉네임"
          value={nickNameToFind}
          onChange={({target: {value}}) => setNickNameToFind(value)} />
        <button onClick={search}>Search</button>
      </div>
      {isRecordOpen ? <Record stats={stats}/> : <></>}
    </div>
  );
}

export default RecordContent;