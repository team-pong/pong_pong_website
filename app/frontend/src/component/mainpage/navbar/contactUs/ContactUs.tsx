import { FC, FormEvent, useState } from "react";
import "/src/scss/content/contactus/ContactUs.scss";

const ContactUs: FC = (): JSX.Element => {

  const [head, setHead] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");

  /*!
   * @breif yochoi
   * @details 문의하기 버튼을 눌렀을 때 실행할 동작
   * @todo 문의 API가 완성되면 연동해야함
   */
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (head === "") alert("제목을 입력해주세요");
    else if (email === "") alert("이메일을 입력해주세요");
    else if (body === "") alert("본문을 입력해주세요");
  }

  return (
    <div className="contact-us">
      <div className="top-bar">
        <span>문의하기</span>
      </div>
      <form className="contact-us-form" onSubmit={onSubmit}>

        <span className="head">제목:</span>
        <input
          type="text"
          className="head-content"
          placeholder="문의 제목을 입력해주세요"
          value={head}
          onChange={(e) => {setHead(e.target.value)}}/>

        <span className="email">이메일:</span>
        <input
          type="text"
          className="email-content"
          placeholder="답변을 받을 이메일을 입력해주세요"
          value={email}
          onChange={(e) => {setEmail(e.target.value)}}/>

        <span className="body">내용:</span>
        <textarea
          cols={30}
          rows={10}
          className="body-content"
          placeholder="문의하실 내용을 입력해주세요"
          value={body}
          onChange={(e) => {setBody(e.target.value)}}/>

        <input type="submit" className="submit" value="문의하기" />
      </form>
    </div>
  );
}

export default ContactUs;