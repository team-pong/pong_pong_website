import { FC } from "react";
import "/src/scss/content/contactus/ContactUs.scss";

const ContactUs: FC = (): JSX.Element => {
  return (
    <div className="contact-us">
      <div className="top-bar">
        <span>문의하기</span>
      </div>
      <form className="contact-us-form">
        <span className="head">제목:</span>
        <input type="text" className="head-content" placeholder="문의 제목을 입력해주세요"/>
        <span className="email">이메일:</span>
        <input type="text" className="email-content" placeholder="답변을 받을 이메일을 입력해주세요"/>
        <span className="body">내용:</span>
        <textarea cols={30} rows={10} className="body-content" placeholder="문의하실 내용을 입력해주세요"/>
        <input type="submit" className="submit" value="문의하기" />
      </form>
    </div>
  );
}

export default ContactUs;