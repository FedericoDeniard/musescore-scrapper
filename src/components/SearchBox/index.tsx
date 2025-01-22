import { useState } from "react";
import "./index.css";

export const SearchBox = ({ onClick }: { onClick: (url: string) => void }) => {
  const [url, setUrl] = useState("");

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const handleButtonClick = () => {
    onClick(url);
  };

  return (
    <div className="searchBox">
      <input
        className="search"
        type="text"
        placeholder="Enter the musescore URL"
        value={url}
        onChange={handleInput}
      />
      <input
        className="button"
        type="button"
        value="Download"
        onClick={handleButtonClick}
      />
    </div>
  );
};
