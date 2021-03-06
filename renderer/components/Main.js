import { Layout, Typography, Space, Breadcrumb, BackTop, notification } from "antd";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSchool } from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";

import Sidebar from "../components/Sidebar";

const { Header, Content } = Layout;
const { Title } = Typography;

export default function Main(props) {
  return (
    <Layout className="body">
      <Header className="drag">
        <Space size={40}>
          <Link href="/home" passHref>
            <span style={{ cursor: "pointer" }}>
              <FontAwesomeIcon icon={faSchool} color="white" size="xl" />
            </span>
          </Link>
          <Title
            style={{
              color: "white",
              fontWeight: 400,
              margin: 0,
              fontSize: "2rem",
            }}
          >
            {props.title}
          </Title>
        </Space>
      </Header>
      <Layout>
        <Sidebar course={props.course} name={props.title} sidebar={props.sidebar} />
        <div
          style={{
            overflow: "scroll",
            padding: "10px",
            width: "100%",
          }}
          className="scroll"
        >
          {!props.breadcrumb && props.history ? (
            <Breadcrumb style={{ paddingBottom: "10px" }}>
              {props.history.map((item, index) => (
                item == null ? "" : <Breadcrumb.Item key={index}>
                  <Link href={item[1]}>{item[0]}</Link>
                </Breadcrumb.Item>
              ))}
            </Breadcrumb>
          ) : (
            ""
          )}
          <Content
            style={{
              width: "100%",
            }}
          >
            {props.children}
          </Content>
        </div>
      </Layout>
    </Layout>
  );
}
