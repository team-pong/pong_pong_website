import { FC, useEffect, useState } from "react";
import { Route, RouteComponentProps, withRouter } from "react-router";
import { Link } from "react-router-dom";
import EasyFetch from "../../utils/EasyFetch";
import Modal from "../modal/Modal";
import QuestionContent from "./question/QuestionContent";
import "/src/scss/adminview/AdminView.scss";

interface QuestionPrev {
  question_id: number;
  title: string;
  nick: string;
}

const AdminView: FC<RouteComponentProps> = ({match: {path}}): JSX.Element => {

  const [questionList, setQuestionList] = useState<QuestionPrev[]>([]);

  const getQuestionList = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/questions`, "GET");
    setQuestionList(await easyfetch.fetch());
  }

  useEffect(() => {
    getQuestionList();
  }, []);

  return (
    <div className="admin-view">
      <ul className="question-list">
        {questionList.map((question, idx) => {
          return (
            <Link
              to={`${path}/${question.question_id}`}
              className="question"
              key={idx}>
              <span>제목: {question.title}</span>
              <span>작성자: {question.nick}</span>
            </Link>
          );
        })}
      </ul>
      <Route path={`${path}/:question_id`}><Modal id={Date.now()} content={<QuestionContent />}/></Route>
    </div>
  )
}

export default withRouter(AdminView);