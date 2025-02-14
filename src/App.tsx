import { useEffect, useState } from "react";

import "./App.css";
import { Title } from "./components/Title";
import { SearchBox } from "./components/SearchBox";
import { toast } from "sonner";

function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const downloadUrl = async () => {
    if (url) {
        setLoading(true);

        toast.promise(window.api.download(url), {
          loading: "Downloading...",
          success: () => "Downloaded successfully",
          error: (error) =>
            error.message.replace(
              "Error invoking remote method 'download':",
              ""
            ) || `Error downloading the sheet`,
          finally: async () => setLoading(false),
        });
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
