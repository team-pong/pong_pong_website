/*!
 * @author yochoi
 * @brief Modal 안에 들어갈 config content
 */

import React, { useState } from "react";

const ConfigContent = (): JSX.Element => {

  const [imageURL, setImageURL] = useState("");
  const [nickName, setNickName] = useState("");

  const changeImageURL = (e: React.FormEvent): void => {
    e.preventDefault(); /// form Submit 시 page가 자동으로 reload 되는걸 막아줌
    if (!imageURL) return;
    console.log(`changeImageURL: ${imageURL}`);
    setImageURL("");
  };

  const changeNickName = (e: React.FormEvent): void => {
    e.preventDefault(); /// form Submit 시 page가 자동으로 reload 되는걸 막아줌
    if (!nickName) return;
    console.log(`changeNickName: ${nickName}`);
    setNickName("");
  }

  return (
    <>
      <form onSubmit={changeImageURL}>
        <input placeholder="New Image URL" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImageURL(e.target.value)} />
        <input type="submit" value="변경" />
      </form>
      <form onSubmit={changeNickName}>
        <input placeholder="New Nick Name" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNickName(e.target.value)} />
        <input type="submit" value="변경" />
      </form>
    </>
  );
};

export default ConfigContent;