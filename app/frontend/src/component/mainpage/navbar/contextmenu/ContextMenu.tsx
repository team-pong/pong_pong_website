import { FC } from 'react'

/*!
 * @author yochoi
 * @brief props 로 x, y 좌표를 받아 해당 위치에 context menu를 띄우는 컴포넌트
 * @param[in] x context menu의 x 좌표
 * @param[in] y context menu의 y 좌표
 */

interface contextMenuProps {
  target: string,
  x: number,
  y: number
}

const ContextMenu: FC<contextMenuProps> = ({target, x, y}): JSX.Element => {
  return (
    <ul id="context-menu" style={{ top: y, left: x, }}>
      <li className="cm-list" onClick={() => console.log(`message to ${target}`)}>메세지 보내기</li>
      <li className="cm-list" onClick={() => console.log(`delete ${target}`)}>친구 삭제하기</li>
    </ul>
  );
}

export default ContextMenu;