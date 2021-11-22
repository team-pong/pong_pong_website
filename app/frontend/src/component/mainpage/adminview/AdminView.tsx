import {FC, useEffect, useRef, useState} from "react";
import { Route, RouteComponentProps, withRouter } from "react-router";
import { Link } from "react-router-dom";
import EasyFetch from "../../../utils/EasyFetch";
import Modal from "../../modal/Modal";
import QuestionContent from "./question/QuestionContent";
import "/src/scss/adminview/AdminView.scss";
import "/src/scss/adminview/AdminView-media.scss";
import "/src/scss/adminview/AdminView-mobile.scss";
import QuestionSelector from "./QuestionSelector";
import Time from "../../../utils/Time";

interface QuestionPrev {
  question_id: number;
  title: string;
  nick: string;
  question_time: string;
}

type QuestionType = "answered" | "notAnswered";

const AdminView: FC<RouteComponentProps> = ({match: {path}}): JSX.Element => {

  const [questionType, setQuestionType] = useState<QuestionType>("notAnswered")
  const [questionList, setQuestionList] = useState<QuestionPrev[]>([]);

  const mounted = useRef(false);

  /*!
   * @author yochoi
   * @brief 하위 Component 인 QuestionContent 에서 답변 보내기를 한 후에
   *        AdminView 를 업데이트 하기 위한 State 로, true 냐 false 냐는 전혀 무관함
   */
  const [update, setUpdate] = useState(false);

  const getNotAnsweredQuestionList = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/questions/beforeAnswerQuestions`, "GET");
    const res = await easyfetch.fetch();
    if (mounted.current) setQuestionList(res);
  }

  const getAnsweredQuestionList = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/questions/afterAnswerQuestions`, "GET");
    const res = await easyfetch.fetch();
    if (mounted.current) setQuestionList(res);
  }

  useEffect(() => {
    if (questionType === "notAnswered") getNotAnsweredQuestionList();
    else if (questionType === "answered") getAnsweredQuestionList();
  }, [questionType]);

  useEffect(() => {
    if (questionType === "notAnswered") getNotAnsweredQuestionList();
    else if (questionType === "answered") getAnsweredQuestionList();
  }, [update]);

  useEffect(() => {
    document.getElementById("button-container").style.display = "none";
    return (() => {document.getElementById("button-container").style.display = "grid"});
  }, []);

  useEffect(() => {
    mounted.current = true;
    return (() => {mounted.current = false});
  }, []);

  return (
    <div className="admin-view">
      <QuestionSelector questionType={questionType} setQuestionType={setQuestionType} />
      <ul className="question-list">
        {questionList.map((question, idx) => {
          return (
            <Link
              to={`${path}/${question.question_id}`}
              className="question"
              key={idx}>
              <span>제목: {question.title}</span><br/>
              <span>작성자: {question.nick}</span><br/>
              <span>작성시점: {new Time(question.question_time).getWholeTime()}</span>
            </Link>
          );
        })}
      </ul>
      <Route path={`${path}/:question_id`}>
        <Modal id={Date.now()} content={<QuestionContent update={update} setUpdate={setUpdate}/>}/>
      </Route>
    </div>
  )
}

export default withRouter(AdminView);