import { FC, createContext, useState } from "react";

interface UserInfo {
  user_id: string;
  nick: string;
  avatar_url: string;
  total_games: number;
  win_games: number;
  loss_games: number;
  ladder_level: number;
  status: string;
}

export const UserInfoContext = createContext(null);
export const SetUserInfoContext = createContext(null);

const Global: FC = ({children}): JSX.Element => {

  const [userInfo, setUserInfo] = useState<UserInfo>(null);

  return (
    <UserInfoContext.Provider value={userInfo}>
      <SetUserInfoContext.Provider value={setUserInfo}>
        {children}
      </SetUserInfoContext.Provider>
    </UserInfoContext.Provider>
  );
}

export default Global;