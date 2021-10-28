import { FC, useEffect, useState } from "react";
import { useHistory } from "react-router";
import EasyFetch from "../../../utils/EasyFetch";
import "/src/scss/content/QuestionContent.scss";

interface Question {
  question_id: number;
  user_id: string;
  title: string;
  email: string;
  content: string;
}

const QuestionContent: FC = (): JSX.Element => {

  const [targetAvatar, setTargetAvatar] = useState("");
  const [questionInfo, setQuestionInfo] = useState<Question>({
    question_id: 0,
    user_id: "",
    title: "",
    email: "",
    content: ""
  })
  const [answerEmail, setAnswerEmail] = useState("");
  const [answerBody, setAnswerBody] = useState("");

  const history = useHistory();

  const getQuestionInfo = async () => {
    /* get question info */
    const questionId = +history.location.pathname.split("/")[3];
    const easyfetch = new EasyFetch(`${global.BE_HOST}/questions/oneQuestion?question_id=${questionId}`, "GET");
    const res: Question = await easyfetch.fetch();

    /* get inquirer avatar */
    const easyfetch2 = new EasyFetch(`${global.BE_HOST}/users?nick=${res.user_id}`, "GET");
    const avatar: string = (await easyfetch2.fetch()).avatar_url;
    setTargetAvatar(avatar);
    setQuestionInfo(res);
    setAnswerEmail(res.email);
  }

  useEffect(() => {
    getQuestionInfo();
  }, []);

  return (
    <div className="question-content">
      <div className="top-bar">
        <span>문의 상세 및 답변하기</span>
      </div>
      <section className="question-info">
        <h1 className="question-info-title">{questionInfo.title}</h1>
        <div className="inquirer-info">
          <img src={targetAvatar} alt="avatar" className="question-info-avatar" />
          <div className="question-info-from">{questionInfo.user_id}</div>
          <div className="question-info-email">{questionInfo.email}</div>
        </div>
        <div className="question-info-content">{questionInfo.content}</div>
      </section>
      <section className="question-answer">
        <form>
          <label className="email-target-label">이메일: </label>
          <input
            type="text"
            className="email-target"
            value={answerEmail}
            onChange={(e) => setAnswerEmail(e.target.value)}/>
          <label className="body-label">본문: </label>
          <textarea rows={50} cols={50}
            className="body"
            value={answerBody}
            onChange={(e) => setAnswerBody(e.target.value)}/>
          <input className="send" type="submit" value="답변 보내기" />
        </form>
      </section>
    </div>
  );
}

export default QuestionContent;