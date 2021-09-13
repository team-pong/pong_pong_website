import { FC } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";

const GameRoomContent: FC<RouteComponentProps> = ({match: {params}}) => {
  return (
    <>roomID: {(params as any).roomId}</>
  );
};

export default withRouter(GameRoomContent);