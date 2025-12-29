import { Button } from "antd";
import { ExpandOutlined } from "@ant-design/icons";

import EditOptions from "../EditButton";
import SearchNodeBar from "./SearchNodeBar";
import { pubsub } from "@/utils/pubsub";

const ViewMenu = ({ openImportModal, openAutoModal }) => {
  const { publish } = pubsub;
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 50,
          left: 10,
        }}
      >
        <SearchNodeBar />
      </div>
    </>
  );
};

export default ViewMenu;
