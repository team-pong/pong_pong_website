import { FC, createContext, useState, SetStateAction, Dispatch } from "react";
import Notice, { NoticeState } from "./component/notice/Notice";

type setter<TYPE> = Dispatch<SetStateAction<TYPE>>;

interface UserInfo {
  user_id: string;
  nick: string;
  avatar_url: string;
  total_games: number;
  win_games: number;
  loss_games: number;
  ladder_level: number;
  status: string;
  admin: boolean;
};

export interface ChatRequest {
  from: string,
  chatTitle: string,
  channelId: number,
};

export interface GameRequest {
  from: string,
  gameMap: number,
};

export interface DmInfo {
  chatRequest?: ChatRequest;
  gameRequest?: GameRequest;
  isDmOpen: boolean;
  target: string;
};

export const UserInfoContext = createContext<UserInfo>(null);
export const SetUserInfoContext = createContext<setter<UserInfo>>(null);

export const DmInfoContext = createContext<DmInfo>(null);
export const SetDmInfoContext = createContext<setter<DmInfo>>(null);

export const SetNoticeInfoContext = createContext<setter<NoticeState>>(null);

const Global: FC = ({children}): JSX.Element => {

  const [userInfo, setUserInfo] = useState<UserInfo>({
    user_id: "",
    nick: "",
    avatar_url: "",
    total_games: 0,
    win_games: 0,
    loss_games: 0,
    ladder_level: 0,
    status: "",
    admin: false
  });

  const [dmInfo, setDmInfo] = useState<DmInfo>({
    chatRequest: null,
    gameRequest: null,
    isDmOpen: false,
    target: ""
  });
  const [noticeInfo, setNoticeInfo] = useState<NoticeState>({
    isOpen: false,
    seconds: 0,
    content: "",
    backgroundColor: ""
  });

  return (
    <>
      <UserInfoContext.Provider value={userInfo}>
        <SetUserInfoContext.Provider value={setUserInfo}>
          <DmInfoContext.Provider value={dmInfo}>
            <SetDmInfoContext.Provider value={setDmInfo}>
              <SetNoticeInfoContext.Provider value={setNoticeInfo}>
                {children}
              </SetNoticeInfoContext.Provider>
            </SetDmInfoContext.Provider>
          </DmInfoContext.Provider>
        </SetUserInfoContext.Provider>
      </UserInfoContext.Provider>
      <Notice noticeInfo={noticeInfo} setNoticeInfo={setNoticeInfo} />
    </>
  );
}

export default Global;