import React, { FC, ReactElement, useEffect } from "react";
import "/src/scss/Modal.scss";
import ChatContent from './content/ChatContent';
import RecordContent from './content/RecordContent';
import {SMALL_MODAL} from "../../utils/constant";
import { RouteComponentProps, withRouter } from "react-router";

/*!
* @author yochoi, donglee
* @brief FC를 Modal 형태로 띄워주는 컴포넌트
* @param[in] content: Modal 안에 들어갈 함수형 컴포넌트
* @param[in] modalSize?: modal width, height px 사이즈.
* @param[in] id?: css 태그를 특정하기 위한 id (시간값)
*/

interface modalProps {
  content: ReactElement;
  modalSize?: Array<string>;
  id: number;
}

const Modal: FC<modalProps & RouteComponentProps> = ({ history, content, modalSize, id }): JSX.Element => {

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
    e.preventDefault();
    if (e.target === e.currentTarget) {
      closer(e);
    }
  };

  /*!
  * @author donglee
  * @brief modal의 사이즈값이 있을 때 css값을 바꿔주는 함수
  */
  const initModalSize = () => {
    if (modalSize) {
      const modal = document.getElementById(contentId);
      
      modal.style.width = SMALL_MODAL[0];
      modal.style.height = SMALL_MODAL[1];
    }
  };

  useEffect(() => {
    initModalSize();
  }, []);

  return (
    <div className="modal" id={modalId} onClick={detectOutsideOfModal}>
      <div className="content" id={contentId}>
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
export { ChatContent, RecordContent };