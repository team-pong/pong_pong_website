import React, { FC, ReactElement } from "react";
import "/src/scss/Modal.scss";
import ChatContent from './content/chat/ChatContent';
import RecordContent from './content/record/RecordContent';
import GameContent from "./content/game/GameContent";
import { RouteComponentProps, withRouter } from "react-router";

/*!
* @author yochoi, donglee
* @brief FC를 Modal 형태로 띄워주는 컴포넌트
* @param[in] content: Modal 안에 들어갈 함수형 컴포넌트
* @param[in] modalSize?: true이면 width: 400px, height: 500px
* @param[in] id: css 태그를 특정하기 위한 id (시간값)
*/

interface modalProps {
  content: ReactElement;
  smallModal?: boolean;
  id: number;
}

const Modal: FC<modalProps & RouteComponentProps> = ({ history, content, smallModal, id }): JSX.Element => {

  const modalId = String(id); //css className=modal 요소의 id
  const contentId = String(id + 1); //css className=content 요소의 id
  const modalCloserId = String(id + 2); //css className=modalCloser 요소의 id

  /*!
  * @author donglee
  * @brief 모달 컴포넌트를 종료할 때 실행하는 함수.
  *        history 객체를 이용해서 뒤로가기를 실행시킴.
  */
  const closer = (e?: any) => {
    if (e) e.stopPropagation();  //detectOutsideOfModal 함수를 부르지 않기 위함.
    history.goBack();
  }
  
  const detectOutsideOfModal = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closer(e);
    }
  };

  return (
    <div className="modal" id={modalId} onClick={detectOutsideOfModal}>
      <div className={["content", smallModal && "small-content"].join(" ")} id={contentId}>
        <img
          className="modal-closer"
          id={modalCloserId}
          src="/public/close-window.png"
          onClick={closer}
          alt="close"/>
        {content}
      </div>
    </div>
  );
};

export default withRouter(Modal);
export { ChatContent, RecordContent, GameContent };