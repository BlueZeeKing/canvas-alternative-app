import { useRouter } from "next/router";
import DOMPurify from "isomorphic-dompurify";
import { useEffect } from "react";
import { Skeleton } from "antd";

import Main from "../../components/Main";
import Header from "../../components/Header";
import useSessionStorage from "../../hooks/useSessionStorage";
import useAPI from "../../hooks/useAPI";

export default function App(props) {
  const router = useRouter();
  const [storage, set, reset] = useSessionStorage();
  const [data, ready] = useAPI(
    `/courses/${router.query.course}/front_page`,
    [],
    () => null
  );

  useEffect(() => set("Home Page", `/${router.query.course}/wiki?title=${router.query.title}`, 2), []);

  return (
    <>
      <Header />

      <Main
        history={storage}
        title={router.query.title}
        page
        course={router.query.course}
      >
        <div style={{ padding: "10px" }}>
          {ready ? (
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(data.body, {
                  USE_PROFILES: { html: true },
                }),
              }}
            ></div>
          ) : (
            <Skeleton active />
          )}
        </div>
      </Main>
    </>
  );
}