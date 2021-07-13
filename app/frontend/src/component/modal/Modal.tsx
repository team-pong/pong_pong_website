import React, { FC, useEffect } from "react";
import "/src/scss/Modal.scss";

import ChatContent from './content/ChatContent';
import ConfigContent from './content/ConfigContent'

/*!
 * @author yochoi, donglee
 * @brief display 에 맞춰 Modal 컴포넌트를 마운트, 언마운트 해주는 FC
 * @param[in] content: Modal 안에 들어갈 FC
 * @param[in] display: Modal 의 display 여부
 * @param[in] stateSetter: Modal의 상위 컴포넌트 state를 조정함으로써 display를 결정함
 */

interface modalControllerProps {
  content: FC;
  display: boolean;
  stateSetter: React.Dispatch<React.SetStateAction<boolean>>;
}

const ModalController: FC<modalControllerProps> = ({
  content,
  display,
  stateSetter,
}): JSX.Element => {
  if (display) {
    return <Modal content={content} stateSetter={stateSetter} />;
  } else {
    return <></>;
  }
};

/*!
 * @author yochoi
 * @brief FC를 Modal 형태로 띄워주는 컴포넌트
 * @param[in] content: Modal 안에 들어갈 함수형 컴포넌트
 * @param[in] stateSetter: Modal의 상위 컴포넌트 state를 조정함으로써 display를 결정함
 */

interface modalPros {
  content: FC;
  stateSetter: React.Dispatch<React.SetStateAction<boolean>>;
}

const Modal: FC<modalPros> = ({ content, stateSetter }): JSX.Element => {
  
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

  useEffect(() => {
    showAnimatedModal();
    document.addEventListener("keyup", detectESC);
    return () => document.removeEventListener("keyup", detectESC);
  }, []);

  return (
    <div id="modal" onClick={detectOutsideOfModal}>
      <div id="content">
        <img src="./public/closeWindow.png" onClick={closer} alt="close" />
        {content({})}
      </div>
    </div>
  );
};

export { ModalController, ChatContent, ConfigContent };
