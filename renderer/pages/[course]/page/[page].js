import { useRouter } from "next/router";
import { Skeleton, Typography, Divider } from "antd";
import DOMPurify from "isomorphic-dompurify";
import { useEffect } from "react";

const { Title, Text } = Typography;

import Main from "../../../components/Main";
import Header from "../../../components/Header";
import Center from "../../../components/Center";
import useAPI from "../../../hooks/useAPI";
import useSessionStorage from "../../../hooks/useSessionStorage";

export default function App(props) {
  const router = useRouter();
  const [storage, set, reset] = useSessionStorage();

  const [data, ready] = useAPI(
    `/courses/${router.query.course}/pages${router.query.page}`,
    [],
    (data) => set(data.title, `/${router.query.course}/page/${router.query.page}?title=${router.query.title}`, 3)
  );

  useEffect(() => set("Page", `/${router.query.course}/page/${router.query.page}?title=${router.query.title}`, 3), []);
  // TODO: make menu item group actually surround the items
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
          {ready ? (
            <>
              <Title>{data.title}</Title>
              <Text style={{ color: "gray" }}>
                {new Date(Date.parse(data.created_at)).toLocaleString("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                })}
              </Text>
            </>
          ) : (
            <Skeleton paragraph={false} />
          )}
          <Divider />
          {ready ? (
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(data.body, {
                  USE_PROFILES: { html: true },
                }),
              }}
            ></div>
          ) : (
            <Skeleton active paragraph={false} />
          )}
        </div>
      </Main>
    </>
  );
}

export async function getServerSideProps(context) {
  
  const [res, tabsRaw] = await Promise.all([
    fetch(
      `https://apsva.instructure.com/api/v1/courses/${context.params.course}/pages/${context.params.page}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`,
        },
      }
    ),
    fetch(
      `https://apsva.instructure.com/api/v1/courses/${context.params.course}/tabs`,
      {
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`,
        },
      }
    ),
  ]);

  const [data, tabs] = await Promise.all([res.json(), tabsRaw.json()]);

  // Pass data to the page via props
  return {
    props: {
      data: data,
      limit: res.headers.get("x-rate-limit-remaining"),
      tabs: tabs,
    },
  };
}