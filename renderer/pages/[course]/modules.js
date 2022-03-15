import { useRouter } from "next/router";
import { Menu, Skeleton } from "antd";
import Link from "next/link";
import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenRuler, faFile, faLink, faNewspaper } from "@fortawesome/free-solid-svg-icons";

const { SubMenu } = Menu;

import Main from "../../components/Main";
import Header from "../../components/Header";
import useSessionStorage from "../../hooks/useSessionStorage";
import useAPI from "../../hooks/useAPI";

export default function App(props) {
  const router = useRouter();
  const [storage, set, reset] = useSessionStorage();
  const [data, ready] = useAPI(`/courses/${router.query.course}/modules`, [
    ["per_page", 50],
    ["include", "items"]
  ]);

  useEffect(() => set("Modules", `/${router.query.course}/modules?title=${router.query.title}`, 2), []);

  return (
    <>
      <Header />

      <Main
        history={storage}
        title={router.query.title}
        course={router.query.course}
        rate_limit={props.limit}
        tabs={props.tabs}
      >
        <div style={{ padding: "10px" }}>
          {ready ? <Menu mode="inline">
            {data.map((module) => (
              <SubMenu key={module.id} title={module.name}>
                {module.items.map((item) => {
                  if (item.type == "SubHeader") {
                    return <Menu.ItemGroup key={item.id} title={item.title} />;
                  } else if (item.type == "Assignment") {
                    return (
                      <Menu.Item
                        key={item.id}
                        style={{ paddingLeft: `${24 * item.indent + 48}px` }}
                      >
                        <Link
                          href={`/${router.query.course}/assignment/${item.content_id}?title=${router.query.title}`}
                          passHref
                        >
                          <div>
                            <FontAwesomeIcon
                              icon={faPenRuler}
                              color="white"
                              style={{ paddingRight: "8px" }}
                            />
                            {item.title}
                          </div>
                        </Link>
                      </Menu.Item>
                    );
                  } else if (item.type == "File") {
                    return (
                      <Menu.Item
                        key={item.id}
                        style={{ paddingLeft: `${24 * item.indent + 48}px` }}
                      >
                        <Link
                          href={`/${router.query.course}/file/${item.content_id}?title=${router.query.title}`}
                          passHref
                        >
                          <div>
                            <FontAwesomeIcon
                              icon={faFile}
                              color="white"
                              style={{ paddingRight: "8px" }}
                            />
                            {item.title}
                          </div>
                        </Link>
                      </Menu.Item>
                    );
                  } else if (item.type == "ExternalUrl") {
                    return (
                      <Menu.Item
                        key={item.id}
                        style={{ paddingLeft: `${24 * item.indent + 48}px` }}
                      >
                        <Link href={item.external_url} passHref>
                          <div>
                            <FontAwesomeIcon
                              icon={faLink}
                              color="white"
                              style={{ paddingRight: "8px" }}
                            />
                            {item.title}
                          </div>
                        </Link>
                      </Menu.Item>
                    );
                  } else if (item.type == "Page") {
                    return (
                      <Menu.Item
                        key={item.id}
                        style={{ paddingLeft: `${24 * item.indent + 48}px` }}
                      >
                        <Link
                          href={`/${router.query.course}/page/${item.page_url}?title=${router.query.title}`}
                          passHref
                        >
                          <div>
                            <FontAwesomeIcon
                              icon={faNewspaper}
                              color="white"
                              style={{ paddingRight: "8px" }}
                            />
                            {item.title}
                          </div>
                        </Link>
                      </Menu.Item>
                    );
                  } else {
                    return (
                      <Menu.Item
                        key={item.id}
                        style={{ paddingLeft: `${24 * item.indent + 48}px` }}
                      >
                        <Link href="/home">{item.title}</Link>
                      </Menu.Item>
                    );
                  }
                })}
              </SubMenu>
            ))}
          </Menu> : <Skeleton active />}
        </div>
      </Main>
    </>
  );
}