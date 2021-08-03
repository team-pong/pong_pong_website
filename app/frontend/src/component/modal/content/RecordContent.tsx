import { FC, useState } from "react";
import "../../../scss/content/RecordContent.scss";
import EasyFetch from "../../../utils/EasyFetch";

interface statistics {
  total_games: number,
  win_games: number,
  loss_games: number,
  winning_rate: number,
  ladder_level: number
}

const RecordContent: FC = (): JSX.Element => {

  const [nickNameToFind, setNickNameToFind] = useState("");
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
      setStats({
        total_games: res.total_games,
        win_games: res.win_games,
        loss_games: res.loss_games,
        winning_rate: (res.win_games / res.total_games) * 100,
        ladder_level: res.ladder_level
      });
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
      {stats.total_games}/{stats.win_games}/{stats.ladder_level}
    </div>
  );
}

export default RecordContent;