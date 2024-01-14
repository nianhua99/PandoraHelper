import {Progress, Tooltip} from "antd";
import {useQuery} from "@tanstack/react-query";
import sysService from "@/api/services/sysService.ts";
import dayjs from "dayjs";

const PandoraUsage = () => {

  const {data} = useQuery({
    queryKey: ['pandora-usage'],
    queryFn: sysService.getPandoraUsage,
    staleTime: 1000 * 30, // 30s
  })

  return (
    <div className="flex items-center justify-center w-15 h-10">
      {data &&
        <Tooltip title={`已用: ${data.current} , 总共: ${data.total} , 将于 ${dayjs().add(data.ttl, 'second').format('YYYY-MM-DD HH:mm:ss')} 重置`}>
          <Progress percent={Math.round((1 - (data.current / data.total)) * 100)} size="small" steps={10} strokeColor={'#52c41a'}  trailColor={'#fa8c16'}/>
        </Tooltip>
      }
    </div>
  );
};

export default PandoraUsage;
