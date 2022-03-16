import Link from "next/link";
import { Card, Space, Skeleton } from "antd";
import { useEffect } from "react";

import Main from "../components/Main";
import Header from "../components/Header";

import useSessionStorage from "../hooks/useSessionStorage";
import useAPI from "../hooks/useAPI";

export default function Home(props) {
  const [data, ready] = useAPI("/courses", [
    ["per_page", 50],
    ["enrollment_state", "active"],
    ["state", "available"],
    ["include", "favorites"],
  ], () => ( null ));

  const [storage, set, reset] = useSessionStorage();

  useEffect(() => reset([["Home", "/home"]]), []);
  // TODO: Make fill work on mobile
  return (
    <>
      <Header />

      <Main
        history={storage}
        title="Dashboard"
        breadcrumb
        sidebar
      >
        <Space style={{ width: "100%", padding: "10px" }} wrap>
          {ready ? data
            .filter((item) => item.is_favorite)
            .map((item) => (
              <Link
                key={item.id}
                href={`/${item.id}/${item.default_view}?title=${item.name}`}
                passHref
              >
                <Card
                  title={item.name}
                  style={{
                    width: "300px",
                    minHeight: "150px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    set(
                      item.name,
                      `/${item.id}/${item.default_view}?title=${item.name}`,
                      1
                    );
                  }}
                >
                  <p style={{ margin: 0 }}>{item.course_code}</p>
                  <p style={{ margin: 0 }}>{item.public_description}</p>
                </Card>
              </Link>
            )): <Skeleton active />}
        </Space>
      </Main>
    </>
  );
}