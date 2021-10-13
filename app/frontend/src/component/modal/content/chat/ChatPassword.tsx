import { FC, useEffect, useState } from "react";
import { Redirect, RouteComponentProps, useParams, withRouter } from "react-router-dom";
import EasyFetch from "../../../../utils/EasyFetch";

const ChatPassword: FC<RouteComponentProps> = (props): JSX.Element => {
  const [password, setPassword] = useState("");
  const [isCorrectPW, setIsCorrectPW] = useState(false);
  const { channel_id } = useParams<{channel_id: string}>();

  console.log("passwd chaeenlId: ", channel_id);

  /*!
   * @author donglee
   * @brief 비밀번호를 입력하면 백엔드 검증 요청 후 대화방을 보여주거나 입장을 거절함
   */
  const submitPassword = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const easyfetch = new EasyFetch(`${global.BE_HOST}/chat/checkPasswd?channel_id=${channel_id}&passwd=${password}`);
    const res = await easyfetch.fetch();
 
    if (res) {
      setIsCorrectPW(true);
    } else {
      alert("비밀번호가 틀렸습니다.");
    }
  };

  /*!
   * @author donglee
   * @brief 자동으로 비밀번호 input에 focus함
   */
  const inputFocus = () => {
    const input = document.getElementsByClassName("pw-input")[0] as HTMLInputElement;

    input.focus();
  }

  /*!
   * @author donglee
   * @brief - 내가 직접 만든 비공개방 첫 입장 시에는 ChatPassword 컴포넌트를 보여주지 않고 ChatRoom으로 리다이렉트함
   *        - 자동으로 input에 focus함.
   */
  useEffect(() => {
    if (props.location.state) {
      setIsCorrectPW(true);
    }
    inputFocus();
  }, []);

  if (isCorrectPW) {
    return <Redirect to={{pathname: `/mainpage/chat/${channel_id}`}} />;
  } else {
    return (
      <div className="pw-container">
        <div className="password-lock-container">
          <img className="password-lock-img" src="/public/protected.png" alt="자물쇠" />
        </div>
        <span className="pw-explain">이 대화방은 비공개방입니다</span>
        <span className="pw-explain">비밀번호를 입력하세요</span>
        <form>
          <input
            className="pw-input"
            type="password"
            minLength={4}
            maxLength={10}
            size={10}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {if (e.key === "Enter") submitPassword(e)}} />
        </form>
      </div>
    );
  }
}

export default withRouter(ChatPassword);