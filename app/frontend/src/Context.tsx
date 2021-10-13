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

interface DmInfo {
  isDmOpen: boolean;
  target: string;
}

export const UserInfoContext = createContext(null);
export const SetUserInfoContext = createContext(null);

export const DmInfoContext = createContext(null);
export const SetDmInfoContext = createContext(null);

const Global: FC = ({children}): JSX.Element => {

  const [userInfo, setUserInfo] = useState<UserInfo>(null);
  const [dmInfo, setDmInfo] = useState<DmInfo>({isDmOpen: false, target: ""});

  return (
    <UserInfoContext.Provider value={userInfo}>
      <SetUserInfoContext.Provider value={setUserInfo}>
        <DmInfoContext.Provider value={dmInfo}>
          <SetDmInfoContext.Provider value={setDmInfo}>
            {children}
          </SetDmInfoContext.Provider>
        </DmInfoContext.Provider>
      </SetUserInfoContext.Provider>
    </UserInfoContext.Provider>
  );
}

export default Global;