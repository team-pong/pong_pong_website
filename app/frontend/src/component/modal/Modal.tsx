import { FC } from 'react';
import "/src/scss/Modal.scss";

import ConfigContent from './content/ConfigContent'

/*!
 * @author yochoi
 * @brief display 에 맞춰 Modal 컴포넌트를 마운트, 언마운트 해주는 FC
 * @param[in] content: Modal 안에 들어갈 FC
 * @param[in] display: Modal 의 display 여부
 * @param[in] closer: Modal 의 상위 컴포넌트에서 display를 제어해줄 함수
 */

interface modalControllerProps {
  content: FC,
  display: boolean,
  closer: () => void
};

const ModalController: FC<modalControllerProps> = ({content, display, closer}): JSX.Element => {
  if (display) {
    return <Modal content={content} closer={closer}/>;
  } else {
    return <></>;
  }
}

/*!
 * @author yochoi
 * @brief FC를 Modal 형태로 띄워주는 컴포넌트
 * @param[in] content: Modal 안에 들어갈 함수형 컴포넌트
 * @param[in] closer: Modal 의 상위 컴포넌트에서 display를 제어해줄 함수
 */

interface modalPros {
  content: FC,
  closer: () => void
}

const Modal: FC<modalPros> = ({content, closer}): JSX.Element => {
  return (
    <div id="modal">
      <div id="content">
        <img src="./public/closeWindow.png" onClick={closer}alt="close" />
        {content({})}
      </div>
    </div>
  );
}

export { ModalController, ConfigContent };