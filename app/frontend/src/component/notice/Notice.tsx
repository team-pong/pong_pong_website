import { FC, Dispatch, SetStateAction, useEffect, useRef, CSSProperties } from "react";
import "/src/scss/notice/Notice.scss";

interface NoticeProps {
  seconds: number,
  content: string,
  style?: CSSProperties,
  isNoticeOpen: boolean,
  setIsNoticeOpen: Dispatch<SetStateAction<boolean>>
}

/*!
  * @author yochoi
  * @brief 지정된 초 만큼 알림을 띄우고 사라지는 컴포넌트
  * @params[in]
  *             seconds: 알림을 띄울 시간, 초 단위
  *             content: 알림 안에 들어갈 문장
  *             style: 알림창 스타일을 지정할 객체 
  *             isNoticeOpen: 알림을 띄울지 결정하는 State로, true면 알림을 띄우고 지정된 시간이 지나면 다시 false로 세팅됨
  *             setIsNoticeOpen: 지정된 시간만큼의 시간이 지나면 isNoticeOpen 을 false 로 세팅하기 위한 함수
  * @details
  *             1. const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  *             2. <Notice
  *                  seconds={3}
  *                  content="알림 안에 들어갈 내용을 입력해 주세요"
  *                  style={{backgroundColor: "green"}}
  *                  isNoticeOpen={isNoticeOpen}
  *                  setIsNoticeOpen={setIsNoticeOpen}/>
  *             3. <button onClick={() => setIsNoticeOpen(true)}/>
  * @warning
  *             in, out 애니메이션 시간이 각각 1초 이므로,
  *             애니메이션 시간까지 고려하면 Notice가 완전히
  *             사라지기까지 걸리는 시간은 second인자 + 2초임
  */

const Notice: FC<NoticeProps> = ({
  seconds,
  content,
  style,
  isNoticeOpen,
  setIsNoticeOpen
}): JSX.Element => {

  const noticeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isNoticeOpen) {
      setTimeout(() => setIsNoticeOpen(false), seconds * 1000);
      noticeRef.current.className = "notice active";
    } else {
      noticeRef.current.className = "notice inactive";
    }
  }, [isNoticeOpen]);

  useEffect(() => {
    noticeRef.current.className = "notice";
  }, []);

  return (
    <div className="notice" ref={noticeRef} style={style}>
      {content}
    </div>
  );
}

export default Notice;