import { useRouter } from "next/router";
import { Skeleton, Menu } from "antd";
import Link from "next/link";

import { useEffect } from "react";

import Main from "../../components/Main";
import Header from "../../components/Header";
import useAPI from "../../hooks/useAPI";
import useSessionStorage from "../../hooks/useSessionStorage";

export default function App(props) {
  const router = useRouter();
  const [storage, set, reset] = useSessionStorage();
  const [data, ready] = useAPI(
    `/courses/${router.query.course}/discussion_topics`,
    [
      ["per_page", 50],
      ["only_announcements", true],
    ],
    () => null
  );


  useEffect(() => set("Announcements", `/${router.query.course}/announcements?title=${router.query.title}`, 2), []);

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
            <Menu.ItemGroup title="Announcements">
              {ready ? props.data.map((announcement) => (
                <Menu.Item key={announcement.id}>
                  <Link
                    href={`/${router.query.course}/announcement/${announcement.id}?title=${router.query.title}`}
                  >
                    {announcement.title}
                  </Link>
                </Menu.Item>
              )) : <Skeleton active />}
            </Menu.ItemGroup>
          </Menu>
        </div>
      </Main>
    </>
  );
}