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
    `/courses/${router.query.course}/assignments`,
    [["per_page", 80]],
    () => null
  );


  useEffect(() => set("Assignments", `/${router.query.course}/assignments?title=${router.query.title}`, 2), []);

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
            <Menu.ItemGroup title="Assignments">
              {ready ? data.map((assignment) => (
                <Menu.Item key={assignment.id}>
                  <Link
                    href={`/${router.query.course}/assignment/${assignment.id}?title=${router.query.title}`}
                  >
                    {assignment.name}
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