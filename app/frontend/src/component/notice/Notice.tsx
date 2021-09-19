import { FC, Dispatch, SetStateAction, useEffect, useRef, CSSProperties } from "react";
import "/src/scss/notice/Notice.scss";

interface NoticeProps {
  seconds: number,
  content: string,
  backgroundColor?: string,
  isNoticeOpen: boolean,
  setIsNoticeOpen: Dispatch<SetStateAction<boolean>>
}

/*!
  * @author yochoi
  * @brief 지정된 초 만큼 알림을 띄우고 사라지는 컴포넌트
  * @params[in]
  *             seconds: 알림을 띄울 시간, 초 단위
  *             content: 알림 안에 들어갈 문장
  *             backgroundColor: 알림창 색을 지정할 문자열, 기본값은 #62C375
  *             isNoticeOpen: 알림을 띄울지 결정하는 State로, true면 알림을 띄우고 지정된 시간이 지나면 다시 false로 세팅됨
  *             setIsNoticeOpen: 지정된 시간만큼의 시간이 지나면 isNoticeOpen 을 false 로 세팅하기 위한 함수
  * @details
  *             1. const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  *             2. <Notice
  *                  seconds={3}
  *                  content="알림 안에 들어갈 내용을 입력해 주세요"
  *                  backgroundColor="green"
  *                  isNoticeOpen={isNoticeOpen}
  *                  setIsNoticeOpen={setIsNoticeOpen}/>
  *             3. <button onClick={() => setIsNoticeOpen(true)}/>
  * @warning
  *             out 애니메이션 시간이 1초 이므로,
  *             애니메이션 시간까지 고려하면 Notice가 완전히
  *             사라지기까지 걸리는 시간은 second인자 + 1초임
  */

const Notice: FC<NoticeProps> = ({
  seconds,
  content,
  backgroundColor,
  isNoticeOpen,
  setIsNoticeOpen
}): JSX.Element => {

  const noticeRef = useRef<HTMLDivElement>(null);
  const progressBarAnimation = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isNoticeOpen) {
      setTimeout(() => setIsNoticeOpen(false), seconds * 1000);
      noticeRef.current.className = "notice active";
      progressBarAnimation.current.style.animation = `notice-progress-animation ${seconds}s linear`;
    } else {
      noticeRef.current.className = "notice inactive";
      progressBarAnimation.current.style.animation = "";
    }
  }, [isNoticeOpen]);

  useEffect(() => {
    noticeRef.current.className = "notice";
  }, []);

  return (
    <div className="notice" ref={noticeRef} style={{backgroundColor: backgroundColor}}>
      {content}
      <div className="notice-progress-bar" style={{backgroundColor: backgroundColor}}>
        <div className="current" ref={progressBarAnimation}></div>
      </div>
    </div>
  );
}

export default Notice;