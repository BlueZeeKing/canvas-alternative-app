import { useRouter } from "next/router";
import { Skeleton, Menu } from "antd";
import Link from "next/link";

import { useEffect } from "react";

import Main from "../../components/Main";
import Header from "../../components/Header";
import useSessionStorage from "../../hooks/useSessionStorage";
import useAPI from "../../hooks/useAPI";

export default function App(props) {
  const router = useRouter();
  const [storage, set, reset] = useSessionStorage();
  const [data, ready] = useAPI(
    `/courses/${router.query.course}/discussion_topics`,
    [["per_page", 50]],
    () => null
  );

  useEffect(() => set("Discussions", `/${router.query.course}/discussions?title=${router.query.title}`, 2), []);

  return (
    <>
      <Header />

      <Main
        history={storage}
        title={router.query.title}
        course={router.query.course}
      >
        <div style={{ padding: "10px" }}>
          <Menu mode="inline">
            <Menu.ItemGroup title="Discussions">
              {ready ? data.map((discussion) => (
                <Menu.Item key={discussion.id}>
                  <Link
                    href={`/${router.query.course}/discussion/${discussion.id}?title=${router.query.title}`}
                  >
                    {discussion.title}
                  </Link>
                </Menu.Item>
              )) : <Skeleton active/>}
            </Menu.ItemGroup>
          </Menu>
        </div>
      </Main>
    </>
  );
}
