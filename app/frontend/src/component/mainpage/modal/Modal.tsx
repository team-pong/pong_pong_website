import { FC, useEffect } from 'react';
import "/src/scss/Modal.scss";

interface modalProps {
  content: FC,
  display: boolean,
  handleClose: () => void
};

/*!
 * @author yochoi
 * @brief 함수 컴포넌트를 모달 형태로 띄워주는 컴포넌트
 * @param[in] props.content 모달 안에 들어갈 함수형 컴포넌트
 * @param[in] props.display 모달을 display 할지 여부, 상위 컴포넌트에서 State로 컨트롤 해야함
 * @param[in] props.handleClose 상위 컴포넌트의 modalDisplay State를 컨트롤 해줄 함수
 */

const Modal = (props: modalProps): JSX.Element => {

  const display: string = `${props.display ? 'display-block' : 'display-none'}`;

  return (
    <div className={"modal " + display}>
      <div className="modal content">
        <img src="./public/closeWindow.png" onClick={props.handleClose} alt="close"/>
        {props.content({})}
      </div>
    </div>
  );
}

export default Modal;