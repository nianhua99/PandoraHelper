import {Space} from 'antd';
import BannerCard from "@/pages/dashboard/analysis/banner.tsx";

function Analysis() {
  return (
    <Space direction={"vertical"} size={"large"} style={{width: '100%'}}>
      <BannerCard />
    </Space>
  );
}

export default Analysis;
