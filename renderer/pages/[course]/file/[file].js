import { useRouter } from "next/router";
import { Skeleton, Typography, Divider, Avatar } from "antd";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link"

const Document = dynamic(
  () => import("react-pdf/dist/esm/entry.webpack5").then((pdf) => pdf.Document),
  { ssr: false }
);

const Page = dynamic(
  () => import("react-pdf/dist/esm/entry.webpack5").then((pdf) => pdf.Page),
  { ssr: false }
);

const { Title, Text } = Typography;

import Main from "../../../components/Main";
import Header from "../../../components/Header";
import Center from "../../../components/Center";
import useSessionStorage from "../../../hooks/useSessionStorage";
import useAPI from "../../../hooks/useAPI";

export default function App(props) {
  const [numPages, setNumPages] = useState([]);
  const [storage, set, reset] = useSessionStorage();
  const router = useRouter();

  const [data, ready] = useAPI(`/files/${router.query.file}`, [], () => null);
  const [url, urlReady] = useAPI(
    `/files/${router.query.file}/public_url`,
    [],
    (data) => {
      console.log(data)
      set(data.display_name, `/${router.query.course}/file/${router.query.file}?title=${router.query.title}`, 3)
    }
  );

  function onDocumentLoadSuccess({numPages}) {
    setNumPages(numPages);
  }
  
  function removeTextLayerOffset() {
    const textLayers = document.querySelectorAll(".react-pdf__Page__textContent");
      textLayers.forEach(layer => {
        const { style } = layer;
        style.top = "0";
        style.left = "0";
        style.transform = "";
    });
  }

  useEffect(() => set("File", `/${router.query.course}/file/${router.query.file}?title=${router.query.title}`, 3), []);
  console.log(url)
  return (
    <>
      <Header />

      <Main
        history={storage}
        title={router.query.title}
        course={router.query.course}
        page
      >
        <div style={{ padding: "10px" }}>
          {
            ready ? <>
              <div style={{ display: "flex", verticalAlign: "middle" }}>
                <Title style={{ margin: 0 }}>{data.display_name}</Title>
                <div style={{ flexGrow: 1 }}></div>
                <Center height="46.73px">
                  <Link href={data.url}>Click to download</Link>
                </Center>
              </div>
              <Text style={{ color: "gray" }}>
                {new Date(Date.parse(data.created_at)).toLocaleString(
                  "en-US",
                  {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                  }
                )}
              </Text>
            </> : <Skeleton active paragraph={false} />
          }
          <Divider />
          { urlReady ?
            <Document
              file={url.public_url}
              onLoadSuccess={onDocumentLoadSuccess}
              style={{ width: "100%" }}
            >
              {Array.apply(null, { length: numPages })
                .map(Number.call, Number)
                .map((item, index) =>
                  item == null ? (
                    ""
                  ) : (
                    <Page
                      onLoadSuccess={removeTextLayerOffset}
                      pageNumber={index + 1}
                      key={item}
                      className="page-padding"
                    />
                  )
                )}
            </Document> : <Skeleton active />
          }
        </div>
      </Main>
    </>
  );
}