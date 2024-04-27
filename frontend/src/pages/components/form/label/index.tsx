import {Space, Tooltip} from "antd";
import {InfoCircleOutlined} from "@ant-design/icons";

export default function LabelWithInfo(
  props: {
    label: string;
    info: string;
  }
) {

  return (
    <Space>
      {props.label}
      <Tooltip title={props.info}>
        <InfoCircleOutlined />
      </Tooltip>
    </Space>
  );
}
