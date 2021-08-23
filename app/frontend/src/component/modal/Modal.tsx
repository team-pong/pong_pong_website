import React, { FC, ReactElement, useEffect } from "react";
import "/src/scss/Modal.scss";
import ChatContent from './content/ChatContent';
import ConfigContent from './content/ConfigContent';
import RecordContent from './content/RecordContent';
import {SMALL_MODAL} from "../../utils/constant";
import { RouteComponentProps, withRouter } from "react-router";

/*!
* @author yochoi
* @brief FC를 Modal 형태로 띄워주는 컴포넌트
* @param[in] content: Modal 안에 들어갈 함수형 컴포넌트
* @param[in] stateSetter: Modal의 상위 컴포넌트 state를 조정함으로써 display를 결정함
* @param[in] modalSize?: ModalController에서 받아오는 modal 사이즈.
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
  *       애니메이션 효과가 끝나는 시간 동안 기다렸다가 stateSetter(false)를 통해 컴포넌트 언마운트시킴
  */
  const closer = (e?: any) => {
    if (e) e.stopPropagation();  //detectOutsideOfModal 함수를 부르지 않기 위함.
    // setTimeout(() => { stateSetter(false); }, 700);
    history.goBack();
    // hideAnimatedModal();
  }
  
  const detectOutsideOfModal = (e: React.MouseEvent) => {
    e.preventDefault();
    if (e.target === e.currentTarget) {
      closer(e);
    }
  };

  /*!
  * @author donglee
  * @brief 모달 컴포넌트 활성화시 ESC 키 누르면 컴포넌트가 닫힘
  */
  const detectESC = (e: KeyboardEvent) => {
    console.log("ESC???");
    if (e.key === "Escape") {
      // closer();
    }
  };

  /*!
  * @author donglee
  * @brief 모달 컴포넌트 나타날 때 style만 바꿔주는 animation 함수
  */
  const showAnimatedModal = () => {
    const modal = document.getElementById(modalId);
    const content = document.getElementById(contentId);

    modal.style.opacity = "1";
    modal.style.transition = "all 300ms ease-in-out";
    content.style.opacity = "1";
    content.style.transition =
      "opacity 250ms 500ms ease, transform 350ms 500ms ease";
    content.style.transform = "scale(1)";
  };

  /*!
  * @author donglee
  * @brief 모달 컴포넌트 사라질 때 style만 바꿔주는 animation 함수
  */
  const hideAnimatedModal = () => {
    const modal = document.getElementById(modalId);
    const content = document.getElementById(contentId);

    modal.style.opacity = "0";
    modal.style.transition = "opacity 250ms 500ms ease";
    content.style.opacity = "0";
    content.style.transform = "scale(0.6)";
    content.style.transition = "opacity 250ms 250ms ease, transform 300ms 250ms ease";
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

  /*!
  * @author donglee
  * @brief 
  */
  useEffect(() => {
    initModalSize();
    // showAnimatedModal();

    // document.addEventListener("keyup", detectESC);
    // window.addEventListener("popstate", goBack);
    return () => {
      // document.removeEventListener("keyup", detectESC);
      // window.removeEventListener("popstate", goBack);
    };
  }, []);

  return (
    <div className="modal" id={modalId} onClick={detectOutsideOfModal}>
      <div className="content" id={contentId}>
        <img
          className="modal-closer"
          id={modalCloserId}
          src="/public/closeWindow.png"
          onClick={closer}
          alt="close"/>
        {content}
      </div>
    </div>
  );
};

export default withRouter(Modal);
export { ChatContent, ConfigContent, RecordContent };