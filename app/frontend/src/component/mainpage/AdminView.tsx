import { FC, useEffect, useState } from "react";
import EasyFetch from "../../utils/EasyFetch";
import "/src/scss/adminview/AdminView.scss";

interface Question {
  question_id: number;
  title: string;
  nick: string;
}

const AdminView: FC = (): JSX.Element => {

  const [questionList, setQuestionList] = useState<Question[]>([]);

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
            <li className="question" key={idx}>
              <span>제목: {question.title}</span>
              <span>작성자: {question.nick}</span>
            </li>
          );
        })}
      </ul>
    </div>
  )
}

export default AdminView;