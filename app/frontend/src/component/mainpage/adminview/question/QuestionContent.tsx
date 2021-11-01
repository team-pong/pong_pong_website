import { FC, FormEvent, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router";
import { SetNoticeInfoContext } from "../../../../Context";
import EasyFetch from "../../../../utils/EasyFetch";
import "/src/scss/content/QuestionContent.scss";

interface Question {
  question_id: number;
  nick: string;
  title: string;
  email: string;
  content: string;
  answer: string;
  question_time: string;
}

const QuestionContent: FC = (): JSX.Element => {

  const [targetAvatar, setTargetAvatar] = useState("");
  const [questionInfo, setQuestionInfo] = useState<Question>({
    question_id: 0,
    nick: "",
    title: "",
    email: "",
    content: "",
    answer: "",
    question_time: ""
  })
  const [answerEmail, setAnswerEmail] = useState("");
  const [answerBody, setAnswerBody] = useState("");

  const history = useHistory();

  const setNoticeInfo = useContext(SetNoticeInfoContext);

  const getQuestionInfo = async () => {
    /* get question info */
    const questionId = +history.location.pathname.split("/")[3];
    const easyfetch = new EasyFetch(`${global.BE_HOST}/questions/oneQuestion?question_id=${questionId}`, "GET");
    const res: Question = await easyfetch.fetch();

    /* get inquirer avatar */
    const easyfetch2 = new EasyFetch(`${global.BE_HOST}/users?nick=${res.nick}`, "GET");
    const avatar: string = (await easyfetch2.fetch()).avatar_url;
    setTargetAvatar(avatar);
    setQuestionInfo(res);
    setAnswerEmail(res.email);
  }

  useEffect(() => {
    getQuestionInfo();
  }, []);

  /*!
   * @brief yochoi
   * @details 답변완료로 설정하는 함수
   */
  const setQuestionAsAnswered = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/questions/answer`, "POST");
    const res: {err_msg: string} = await easyfetch.fetch({
      question_id: +history.location.pathname.split("/")[3],
      answer: answerBody
    });
    if (res.err_msg !== "에러가 없습니다.") throw (res.err_msg);
  }

  /*!
   * @brief yochoi
   * @details 문의자에게 답변을 보내는 함수
   *          실패시 에러 문자열을 throw 함
   */
  const sendReply = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/questions/reply`, "POST");
    const res = await easyfetch.fetch({
      email: answerEmail,
      content: answerBody
    });
    if (res.err_msg || res.statusCode === 400) throw (res.err_msg ? res.err_msg : "에러가 발생했습니다.");
  }

  /*!
   * @brief yochoi
   * @details onSubmit 이벤트 발생시 동작하는 함수
   *          에러가 있을 시 Notice 를 띄움
   */
  const onSubmitAnswer = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await sendReply();
      await setQuestionAsAnswered();
      setNoticeInfo({seconds: 3, isOpen: true, content: "답변 작성을 완료했습니다.", backgroundColor: "#62C375"})
    } catch (e) {
      setNoticeInfo({seconds: 3, isOpen: true, content: e.err_msg, backgroundColor: "#CE4D36"})
    }
  }

  return (
    <div className="question-content">
      <div className="top-bar">
        {questionInfo.answer === ""
          ?
          <span>문의 상세 및 답변하기</span>
          :
          <span>문의 및 답변 내역</span>
        }
      </div>
      <section className="question-info">
        <h1 className="question-info-title">{questionInfo.title}</h1>
        <div className="inquirer-info">
          <img src={targetAvatar} alt="avatar" className="question-info-avatar" />
          <div className="question-info-from">{questionInfo.nick}</div>
          <div className="question-info-email">{questionInfo.email}</div>
        </div>
        <div className="question-info-content">{questionInfo.content}</div>
      </section>
      <section className="question-answer">
        <form onSubmit={onSubmitAnswer}>
          <label className="email-target-label">이메일: </label>
          <input
            type="text"
            className="email-target"
            value={answerEmail}
            readOnly
            onChange={(e) => setAnswerEmail(e.target.value)}/>
          <label className="body-label">본문: </label>
          <textarea
            rows={50}
            cols={50}
            className="body"
            readOnly={questionInfo.answer !== ""}
            value={questionInfo.answer === "" ? answerBody : questionInfo.answer}
            onChange={(e) => setAnswerBody(e.target.value)}/>
          {questionInfo.answer === "" && <input className="send" type="submit" name="send" value="답변 보내기" />}
        </form>
      </section>
    </div>
  );
}

export default QuestionContent;