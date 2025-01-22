import { useEffect, useState } from "react";

import "./App.css";
import { Title } from "./components/Title";
import { SearchBox } from "./components/SearchBox";

function App() {
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (url) {
      // Asegúrate de que 'url' no esté vacío antes de hacer ping
      console.log(url);
      window.api.ping();
      window.api.download(url);
    }
  }, [url]); // Esto seguirá siendo reactivo al cambio de 'url'

  return (
    <div className="container-title">
      <Title />
      <SearchBox onClick={(getUrl: string) => setUrl(getUrl)} />
    </div>
  );
}

export default App;
