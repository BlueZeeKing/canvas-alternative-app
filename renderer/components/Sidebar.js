import { Layout, Menu, Skeleton } from "antd";
import Link from "next/link";

const { Sider } = Layout;
const { SubMenu } = Menu;

import useAPI from "../hooks/useAPI";

export default function Sidebar(props) {
  const [tabs, ready] = useAPI(`/courses/${props.course}/tabs`, [], () => ( null ), !props.sidebar);
  return (
    <Sider style={{height: "100%"}}>
      <Menu mode="inline" style={{ minHeight: "100%" }}>
        {ready
          ? tabs
              .filter((item) => item.type == "internal")
              .map((item) => (
                <Menu.Item key={item.id}>
                  <Link href={url(props.course, item)}>{item.label}</Link>
                </Menu.Item>
              ))
          : ""}
      </Menu>
    </Sider>
  );
}

function url(course, item) {
  if (item.id == "home") {
    return `/${course}/wiki`
  } else if (item.id == "announcements") {
    return `/${course}/announcements`
  } else if (item.id == "modules") {
    return `/${course}/modules`;
  } else if (item.id == "assignments") {
    return `/${course}/assignments`;
  } else if (item.id == "discussions") {
    return `/${course}/discussions`;
  } else {
    return item.full_url;
  }
}