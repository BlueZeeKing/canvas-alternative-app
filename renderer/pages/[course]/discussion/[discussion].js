import { useRouter } from "next/router";
import {
  Typography,
  Divider,
  Avatar,
  Comment,
  Tooltip,
  Skeleton
} from "antd";
import DOMPurify from "isomorphic-dompurify";
import { useEffect, useState } from "react";
import {
  LikeOutlined,
  LikeFilled
} from "@ant-design/icons";

const { Title, Text } = Typography;

import Main from "../../../components/Main";
import Header from "../../../components/Header";
import Center from "../../../components/Center";
import useSessionStorage from "../../../hooks/useSessionStorage";
import useAPI from "../../../hooks/useAPI";

export default function App() {
  const router = useRouter();
  const [storage, set, reset] = useSessionStorage();
  const [like, setLike] = useState({});

  const [data, ready] = useAPI(
    `/courses/${router.query.course}/discussion_topics/${router.query.discussion}`,
    [],
    (data) => set(data.title, `/${router.query.course}/discussion/${router.query.discussion}?title=${router.query.title}`, 3)
  );
  const [entries, entriesReady] = useAPI(
    `/courses/${router.query.course}/discussion_topics/${router.query.discussion}/view`,
    [],
    (entries) => setLike(entries.entry_ratings)
  );

  if (entriesReady) {
    const participants = entries.participants.reduce((last, item) => ({ ...last, [item.id]: item}), {})
    const likes = entries.view.map((item) => (item.rating_sum - (entries.entry_ratings[item.id] == 1 ? 1 : 0)));
  }

  function setLikes(item, index) {
    let copy = JSON.parse(JSON.stringify(like));
    copy[item.id] = like[item.id] == 1 ? 0 : 1;

    fetch(
      "/api/rate?" +
        new URLSearchParams([
          ["course", router.query.course],
          ["discussion", router.query.discussion],
          ["item", item.id],
          ["rate", like[item.id] == 1 ? 0 : 1],
        ]),
      {
        headers: {
          Authorization: process.env.API_KEY,
        },
      }
    );

    setLike(copy);
  }

  useEffect(() => set("Discussion", `/${router.query.course}/discussion/${router.query.discussion}?title=${router.query.title}`, 3), []);
  
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
          {ready ? <>
          <div style={{ display: "flex", verticalAlign: "middle" }}>
            <Title style={{ margin: 0 }}>{data.title}</Title>
            <div style={{ flexGrow: 1 }}></div>
            <Center height="46.73px">
              <Text style={{ marginRight: "10px" }}>
                {data.author.display_name}
              </Text>
            </Center>
            <Center height="46.73px">
              <Avatar src={data.author.avatar_image_url} />
            </Center>
          </div>
          <Text style={{ color: "gray" }}>
            {new Date(Date.parse(data.posted_at)).toLocaleString(
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
          </Text> </> : <Skeleton active paragraph={false} />}
          <Divider />
          {ready ?
          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(data.message, {
                USE_PROFILES: { html: true },
              }),
            }}
          ></div> : <Skeleton active title={false} /> }
          <Divider />
          {entriesReady ? entries.view.map((item, index) => (
            <Comment
              key={item.id}
              author={
                <Text>
                  {participants[item.user_id]["display_name"]}{" "}
                  {participants[item.user_id]["pronouns"] == null ? (
                    ""
                  ) : (
                    <span style={{ color: "gray" }}>
                      ({participants[item.user_id]["pronouns"]})
                    </span>
                  )}
                </Text>
              }
              avatar={
                <Avatar
                  src={participants[item.user_id]["avatar_image_url"]}
                  alt="Profile picture"
                />
              }
              content={
                <div
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(item.message, {
                      USE_PROFILES: { html: true },
                    }),
                  }}
                ></div>
              }
              datetime={
                <Text style={{ color: "gray" }}>
                  {new Date(Date.parse(item.created_at)).toLocaleString(
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
              }
              actions={
                data.allow_rating
                  ? [
                      <Tooltip key="comment-like" title="Like">
                        <span onClick={() => setLikes(item, index)}>
                          {like[item.id] == 1 ? (
                            <LikeFilled />
                          ) : (
                            <LikeOutlined />
                          )}
                          &nbsp;
                          <span className="comment-action">
                            {likes[index] + item.id in like ? like[item.id] : 0}
                          </span>
                        </span>
                      </Tooltip>,
                    ]
                  : ""
              }
            />
          )) : <Skeleton avatar active />}
        </div>
      </Main>
    </>
  );
}

export async function getServerSideProps(context) {

  const [res, entries, tabsRaw] = await Promise.all([
    fetch(
      `https://apsva.instructure.com/api/v1/courses/${context.params.course}/discussion_topics/${context.params.discussion}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`,
        },
      }
    ),
    fetch(
      `https://apsva.instructure.com/api/v1/courses/${context.params.course}/discussion_topics/${context.params.discussion}/view`,
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
  // Fetch data from external API

  const [data, entries_data, tabs] = await Promise.all([res.json(), entries.json(), tabsRaw.json()]);

  // Pass data to the page via props
  return {
    props: {
      tabs: tabs,
      data: data,
      entries: entries_data,
      limit: res.headers.get("x-rate-limit-remaining"),
    },
  };
}