import { useEffect, useState } from "react";

import "./App.css";
import { Title } from "./components/Title";
import { SearchBox } from "./components/SearchBox";

function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const downloadUrl = async () => {
    if (url) {
        setLoading(true);
      console.log(url);
        const success = await window.api.download(url);
        setLoading(false);
        console.log(success);
    }
    };

    downloadUrl();
  }, [url]); 

  return (
    <div className="container-title">
      <Title />
      <SearchBox
        onClick={(getUrl: string) => setUrl(getUrl)}
        loading={loading}
      />
    </div>
  );
}

export default App;
