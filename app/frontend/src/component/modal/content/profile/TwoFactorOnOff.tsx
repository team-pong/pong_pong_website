import { FC, useEffect, useRef, useState } from "react";
import EasyFetch from "../../../../utils/EasyFetch";
import "/src/scss/content/profile/TwoFactorOnOff.scss";

const TwoFactorOnOff: FC = (): JSX.Element => {

  const [onOff, setOnOff] = useState(false);

  const sliderRef = useRef<HTMLSpanElement>(null);
  const sliderInsideRef = useRef<HTMLDivElement>(null);

  const getOnOff = async () => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/session/twoFactor`, "GET");
    const res = await easyfetch.fetch();
    if (res.email === "true") {
      setOnOff(true);
    } else {
      setOnOff(false);
    }
  }

  useEffect(() => {
    getOnOff();
  }, []);

  useEffect(() => {
    const easyfetch = new EasyFetch(`${global.BE_HOST}/session/twoFactor`, "POST");
    if (onOff === true) {
      sliderInsideRef.current.style.transform = "translateX(26px)"
      sliderRef.current.style.backgroundColor = "#2196F3";
      easyfetch.fetch({email: true});
    } else {
      sliderInsideRef.current.style.transform = "";
      sliderRef.current.style.backgroundColor = "#ccc";
      easyfetch.fetch({email: false});
    }
  }, [onOff])

  return (
    <div className="two-factor-on-off">
      <h2>이차인증 켜기, 끄기</h2>
      <label className="switch" onClick={() => setOnOff(!onOff)}>
        <span className="slider" ref={sliderRef}><div className="slider-inside" ref={sliderInsideRef}/></span>
      </label>
    </div>
  );
}

export default TwoFactorOnOff;