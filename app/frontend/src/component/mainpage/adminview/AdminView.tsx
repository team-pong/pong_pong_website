import { FC, useEffect, useState } from "react";
import { Route, RouteComponentProps, withRouter } from "react-router";
import { Link } from "react-router-dom";
import EasyFetch from "../../../utils/EasyFetch";
import Modal from "../../modal/Modal";
import QuestionContent from "./question/QuestionContent";
import "/src/scss/adminview/AdminView.scss";
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

  const getNotAnsweredQuestionList = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/questions/beforeAnswerQuestion`, "GET");
    setQuestionList(await easyfetch.fetch());
  }

  const getAnsweredQuestionList = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/questions/afterAnswerQuestionss`, "GET");
    setQuestionList(await easyfetch.fetch());
  }

  useEffect(() => {
    if (questionType === "notAnswered") getNotAnsweredQuestionList();
    else if (questionType === "answered") getAnsweredQuestionList();
  }, [questionType]);

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
      <Route path={`${path}/:question_id`}><Modal id={Date.now()} content={<QuestionContent />}/></Route>
    </div>
  )
}

export default withRouter(AdminView);