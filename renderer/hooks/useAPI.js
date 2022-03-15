import { useEffect, useState } from "react";
import { notification } from "antd";
import electron from "electron";
const ipcRenderer = electron.ipcRenderer || false;

export default function useAPI(url, query, active = true) {
  const [data, setData] = useState({ data: {}, ready: false });

  useEffect(() => {
    if (!data.ready && active) {
      const data = ipcRenderer.sendSync(
        "canvas",
        `https://apsva.instructure.com/api/v1${url}${
          query.length > 0 ? "?" + new URLSearchParams(query).toString() : ""
        }`
      );

      setData({ data: JSON.parse(data), ready: true });
    }
  });

  return [data.data, data.ready];
}
