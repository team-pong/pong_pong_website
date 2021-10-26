import { FC, Dispatch, SetStateAction, useEffect, useRef, CSSProperties } from "react";
import "/src/scss/notice/Notice.scss";

export interface NoticeState {
  isOpen: boolean,
  seconds: number,
  content: string,
  backgroundColor: string,
}

interface NoticeProps {
  noticeInfo: NoticeState,
  setNoticeInfo: Dispatch<SetStateAction<NoticeState>>
}

/*!
  * @author yochoi
  * @brief 지정된 초 만큼 알림을 띄우고 사라지는 컴포넌트
  * @params[in]
  *             noticeInfo: {
  *               isOpen: boolean         -> notice open 여부
  *               seconds: number         -> notice가 몇초 뒤에 꺼질지 정할 수
  *               content: string         -> notice 안에 들어갈 문자열
  *               backgroundColor: string -> notice의 색
  *             }
  *             setNoticeInfo: 지정된 시간만큼의 시간이 지나면 noticeInfo.isOpen 을 false 로 세팅하기 위한 함수
  * @details
  *             1. const setNoticeInfo = useContext(SetNoticeInfoContext);
  *             2. setNoticeInfo({
  *                 isOpen: true,
  *                 seconds: 3,
  *                 content: "안녕하세요"
  *                 backgroundColor: "#62C375"
  *                });
  * @warning
  *             out 애니메이션 시간이 1초 이므로,
  *             애니메이션 시간까지 고려하면 Notice가 완전히
  *             사라지기까지 걸리는 시간은 second인자 + 1초임
  */

const Notice: FC<NoticeProps> = ({
  noticeInfo: {isOpen, seconds, content, backgroundColor},
  setNoticeInfo
}): JSX.Element => {

  const noticeRef = useRef<HTMLDivElement>(null);
  const progressBarAnimation = useRef<HTMLDivElement>(null);

  const openNotice = () => {
    setTimeout(() => setNoticeInfo({isOpen: false, seconds: seconds, content: content, backgroundColor: backgroundColor}), seconds * 1000);
    noticeRef.current.className = "notice active";
    progressBarAnimation.current.style.animation = `notice-progress-animation ${seconds}s linear`;
  }

  const closeNotice = () => {
    noticeRef.current.className = "notice inactive";
    progressBarAnimation.current.style.animation = "";
  }

  useEffect(() => {
    if (isOpen) {
      openNotice();
    } else {
      closeNotice();
    }
  }, [isOpen]);

  useEffect(() => {
    noticeRef.current.className = "notice";
  }, []);

  return (
    <div className="notice" ref={noticeRef} style={{backgroundColor: backgroundColor}}>
      <img
        className="close-notice"
        src="/public/DM-closer.svg"
        alt="close notice"
        onClick={closeNotice}/>
      {content}
      <div className="notice-progress-bar" style={{backgroundColor: backgroundColor}}>
        <div className="current" ref={progressBarAnimation}></div>
      </div>
    </div>
  );
}

export default Notice;