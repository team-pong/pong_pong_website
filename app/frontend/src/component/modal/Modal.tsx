import React, { FC, useEffect } from "react";
import "/src/scss/Modal.scss";
import ChatContent from './content/ChatContent';
import ConfigContent from './content/ConfigContent';
import RecordContent from './content/RecordContent';
import {SMALL_MODAL} from "../../utils/constant";

/*!
 * @author yochoi, donglee
 * @brief display 에 맞춰 Modal 컴포넌트를 마운트, 언마운트 해주는 FC
 * @param[in] content: Modal 안에 들어갈 FC
 * @param[in] display: Modal 의 display 여부
 * @param[in] stateSetter: Modal의 상위 컴포넌트 state를 조정함으로써 display를 결정함
 * @param[in] size?: 작은 modal을 만들 때의 사이즈. 기본값은 css에 정의돼있는 값.
 */

interface modalControllerProps {
  content: FC;
  display: boolean;
  stateSetter: React.Dispatch<React.SetStateAction<boolean>>;
  size?: Array<string>;
}

const ModalController: FC<modalControllerProps> = ({
  content,
  display,
  stateSetter,
  size,
}): JSX.Element => {
  if (display) {
    return <Modal content={content} stateSetter={stateSetter} modalSize={size}/>;
  } else {
    return <></>;
  }
};

/*!
 * @author yochoi
 * @brief FC를 Modal 형태로 띄워주는 컴포넌트
 * @param[in] content: Modal 안에 들어갈 함수형 컴포넌트
 * @param[in] stateSetter: Modal의 상위 컴포넌트 state를 조정함으로써 display를 결정함
 * @param[in] modalSize?: ModalController에서 받아오는 modal 사이즈.
 */

interface modalPros {
  content: FC;
  stateSetter: React.Dispatch<React.SetStateAction<boolean>>;
  modalSize?: Array<string>;
}

const Modal: FC<modalPros> = ({ content, stateSetter, modalSize }): JSX.Element => {
  let isGoBackClicked = false;  //뒤로가기 버튼을 눌렀는지 여부를 저장
  
  /*!
  * @author donglee
  * @brief 모달 컴포넌트를 종료할 때 실행하는 함수.
  *       애니메이션 효과가 끝나는 시간 동안 기다렸다가 stateSetter(false)를 통해 컴포넌트 언마운트시킴
  */
  const closer = () => {
    setTimeout(() => { stateSetter(false); }, 700);
    hideAnimatedModal();
  }
  
  const detectOutsideOfModal = (e: React.MouseEvent) => {
    e.preventDefault();
    if (e.target === e.currentTarget) {
      closer();
    }
  };

  /*!
  * @author donglee
  * @brief 모달 컴포넌트 활성화시 ESC 키 누르면 컴포넌트가 닫힘
  */
  const detectESC = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      closer();
    }
  };

  /*!
  * @author donglee
  * @brief 모달 컴포넌트 나타날 때 style만 바꿔주는 animation 함수
  */
  const showAnimatedModal = () => {
    const modal = document.getElementById("modal");
    const content = document.getElementById("content");

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
    const modal = document.getElementById("modal");
    const content = document.getElementById("content");

    modal.style.opacity = "0";
    modal.style.transition = "opacity 250ms 500ms ease";
    content.style.opacity = "0";
    content.style.transform = "scale(0.6)";
    content.style.transition = "opacity 250ms 250ms ease, transform 300ms 250ms ease";
  };

  /*!
  * @author donglee
  * @brief 모달 컴포넌트에서 브라우저 뒤로가기 버튼을 눌렀을 때
  *        이전 history로 이동하는 것을 방지하고 단순히 모달 컴포넌트만 닫힘
  */
  const goBack = () => {
    isGoBackClicked = true;
    closer();
  };

  /*!
  * @author donglee
  * @brief modal의 사이즈값이 있을 때 css값을 바꿔주는 함수
  */
  const initModalSize = () => {
    if (modalSize) {
      const modal = document.getElementById("content");
      
      modal.style.width = SMALL_MODAL[0];
      modal.style.height = SMALL_MODAL[1];
    }
  };

  /*!
  * @author donglee
  * @brief -history에 새로운 state를 넣어서 뒤로가기시에 모달창만 꺼지도록함
  *        -SEC키와 뒤로가기 버튼에 대한 이벤트리스너를 등록하고 언마운트시에 제거함
  */
  useEffect(() => {
    initModalSize();
    history.pushState({page:"modal"}, document.title);
    showAnimatedModal();

    document.addEventListener("keyup", detectESC);
    window.addEventListener("popstate", goBack);
    return () => {
      document.removeEventListener("keyup", detectESC);
      window.removeEventListener("popstate", goBack);
      //뒤로가기를 누르지 않고 종료할 경우엔 state가 새로 있으니 뒤로가기를 해줘야함.
      if (!isGoBackClicked) {
        history.back();
      }
    };
  }, []);

  return (
    <div id="modal" onClick={detectOutsideOfModal}>
      <div id="content">
        <img src="./public/close-window.svg" onClick={closer} alt="close" id="modal-closer"/>
        {content({})}
      </div>
    </div>
  );
};

export { ModalController, ChatContent, ConfigContent, RecordContent };
