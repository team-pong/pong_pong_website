import {Dispatch, FC, SetStateAction} from "react";
import "/src/scss/adminview/QuestionSelector.scss";

type QuestionType = "answered" | "notAnswered";

interface QuestionSelectorProps {
  questionType: QuestionType;
  setQuestionType: Dispatch<SetStateAction<QuestionType>>;
}

const QuestionSelector: FC<QuestionSelectorProps> =
  ({questionType, setQuestionType}): JSX.Element => {
  return (
    <form className="question-selector">
      <div>
        <input id="not-answered"
               type="radio"
               value="notAnswered"
               checked={questionType === "notAnswered"}
               onChange={e => setQuestionType(e.target.value as QuestionType)} />
        <label htmlFor="not-answered">답변 미완료된 문의</label>
      </div>
      <div>
        <input id="answered"
               type="radio"
               value="answered"
               checked={questionType === "answered"}
               onChange={e => setQuestionType(e.target.value as QuestionType)}/>
        <label htmlFor="answered">답변 완료된 문의</label>
      </div>
    </form>
  );
};

export default QuestionSelector;