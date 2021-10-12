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

export const DmContext = createContext(null);
export const SetDmContext = createContext(null);

const Global: FC = ({children}): JSX.Element => {

  const [userInfo, setUserInfo] = useState<UserInfo>(null);
  const [isDmOpen, setIsDmOpen] = useState(false);

  return (
    <UserInfoContext.Provider value={userInfo}>
      <SetUserInfoContext.Provider value={setUserInfo}>
        <DmContext.Provider value={isDmOpen}>
          <SetDmContext.Provider value={setIsDmOpen}>
            {children}
          </SetDmContext.Provider>
        </DmContext.Provider>
      </SetUserInfoContext.Provider>
    </UserInfoContext.Provider>
  );
}

export default Global;