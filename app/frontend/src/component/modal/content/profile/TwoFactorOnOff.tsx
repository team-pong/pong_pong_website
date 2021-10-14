import { FC } from "react";
import "/src/scss/content/profile/TwoFactorOnOff.scss";

const TwoFactorOnOff: FC = (): JSX.Element => {
  return (
    <div className="two-factor-on-off">
      <h2>이차인증 켜기, 끄기</h2>
      <label className="switch">
        <input type="checkbox"/>
        <span className="slider"></span>
      </label>
    </div>
  );
}

export default TwoFactorOnOff;