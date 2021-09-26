import { FC } from "react";
import "../../../scss/dm/DmRoom.scss";

interface DmRoomProps {
  dmTarget: string;
}

const DmRoom: FC<DmRoomProps> = ({dmTarget}): JSX.Element => {
  return (
    <>target: {dmTarget}</>
  );
};

export default DmRoom;