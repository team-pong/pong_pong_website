import { FC, FormEvent, useContext, useState } from "react";
import { SetNoticeInfoContext } from "../../../../Context";
import EasyFetch from "../../../../utils/EasyFetch";
import { NOTICE_RED } from "../addFriend/AddFriend";
import "/src/scss/content/contactus/ContactUs.scss";

const ContactUs: FC = (): JSX.Element => {

  const [head, setHead] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");

  const setNoticeInfo = useContext(SetNoticeInfoContext);

  /*!
   * @breif yochoi
   * @details 문의하기 버튼을 눌렀을 때 실행할 동작
   */
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (head === "" || email === "" || content === "") {
      setNoticeInfo({
      seconds: 3,
      content: "제목, 이메일, 본문을 입력해주세요",
      backgroundColor: NOTICE_RED,
      isOpen: true
    })} else {
      const easyfetch = new EasyFetch(`${global.BE_HOST}/questions`, "POST");
      const res = await easyfetch.fetch({
        title: head,
        email: email,
        content: content
      });
      if (res.err_msg !== "에러가 없습니다.") {
        setNoticeInfo({isOpen: true, seconds: 3, content: res.err_msg ? res.err_msg : "다시 시도해주세요.", backgroundColor: "#CE4D36"});
      } else setNoticeInfo({isOpen: true, seconds: 3, content: "문의를 보냈습니다.", backgroundColor: "#62C375"});
    }
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
          value={content}
          onChange={(e) => {setContent(e.target.value)}}/>

        <input type="submit" className="submit" value="문의하기" />
      </form>
    </div>
  );
}

export default ContactUs;