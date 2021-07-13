import React, { FC, useEffect } from "react";
import "/src/scss/Modal.scss";

import ChatContent from './content/ChatContent';
import ConfigContent from './content/ConfigContent'

/*!
 * @author yochoi
 * @brief display 에 맞춰 Modal 컴포넌트를 마운트, 언마운트 해주는 FC
 * @param[in] content: Modal 안에 들어갈 FC
 * @param[in] display: Modal 의 display 여부
 * @param[in] closer: Modal 의 상위 컴포넌트에서 display를 제어해줄 함수
 */

interface modalControllerProps {
  content: FC;
  display: boolean;
  closer: () => void;
}

const ModalController: FC<modalControllerProps> = ({
  content,
  display,
  closer,
}): JSX.Element => {
  if (display) {
    return <Modal content={content} closer={closer} />;
  } else {
    return <></>;
  }
};

/*!
 * @author yochoi
 * @brief FC를 Modal 형태로 띄워주는 컴포넌트
 * @param[in] content: Modal 안에 들어갈 함수형 컴포넌트
 * @param[in] closer: Modal 의 상위 컴포넌트에서 display를 제어해줄 함수
 */

interface modalPros {
  content: FC;
  closer: () => void;
}

const Modal: FC<modalPros> = ({ content, closer }): JSX.Element => {
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
  * @brief 모달 컴포넌트 style만 바꿔주는 animation 함수
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
