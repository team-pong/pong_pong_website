import { FC } from "react";
import { RouteComponentProps, withRouter, useHistory } from "react-router-dom";

const GameRoomContent: FC<RouteComponentProps> = ({match: {params}}) => {
  const history = useHistory();
  return (
    <>roomID: {(params as any).roomId}<button onClick={() => {history.goBack();history.goBack();}}>돌아가기</button></>
  );
};

export default withRouter(GameRoomContent);