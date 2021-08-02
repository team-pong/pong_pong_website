import { FC, useState } from "react";

const RecordContent: FC = (): JSX.Element => {

  const [nickNameToFind, setNickNameToFind] = useState("");

  const search = () => {
    if (nickNameToFind) {
      console.log(`try to find ${nickNameToFind}`)
    }
  }

  return (
    <div id="record-content">
      <input
        type="text"
        placeholder="닉네임"
        value={nickNameToFind}
        onChange={({target: {value}}) => setNickNameToFind(value)} />
      <button onClick={search}>Search</button>
    </div>
  );
}

export default RecordContent;