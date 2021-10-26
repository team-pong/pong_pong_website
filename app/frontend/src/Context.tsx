import { FC, createContext, useState, SetStateAction, Dispatch } from "react";
import Notice, { NoticeState } from "./component/notice/Notice";

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

export interface Request {
  from: string,
  chatTitle: string,
  channelId: number,  
};

export interface DmInfo {
  request?: Request;
  isDmOpen: boolean;
  target: string;
}

export const UserInfoContext = createContext(null);
export const SetUserInfoContext = createContext(null);

export const DmInfoContext = createContext(null);
export const SetDmInfoContext = createContext(null);

export const SetNoticeInfoContext = createContext<Dispatch<SetStateAction<NoticeState>>>(null);

const Global: FC = ({children}): JSX.Element => {

  const [userInfo, setUserInfo] = useState<UserInfo>({
    user_id: "",
    nick: "",
    avatar_url: "",
    total_games: 0,
    win_games: 0,
    loss_games: 0,
    ladder_level: 0,
    status: ""
  });

  /* 전역객체다 보니 보내고 나서는 바로 null로 초기화해줘야 한다 */
  const [dmInfo, setDmInfo] = useState<DmInfo>({
    request: null,
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