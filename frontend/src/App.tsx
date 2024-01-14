import { App as AntdApp } from 'antd';

import Router from '@/router/index';
import AntdConfig from '@/theme/antd';


import { MotionLazy } from './components/animate/motion-lazy';
import {Inspector} from "react-dev-inspector";
import {useSettingActions} from "@/store/settingStore.ts";
import {useQuery} from "@tanstack/react-query";
import sysService from "@/api/services/sysService.ts";
import {useEffect} from "react";

function App() {

  const { setCaptchaSiteKey } = useSettingActions()

  const { data } = useQuery({
    queryKey: ['captchaSiteKey'],
    queryFn: sysService.getSetting,
    staleTime: Infinity,
    cacheTime: Infinity,
  })

  useEffect(() => {
    if (data) {
      setCaptchaSiteKey(data.captchaSiteKey)
    }
  }, [data])

  return (
    <AntdConfig>
      <AntdApp>
        <MotionLazy>
          <Inspector />
          <Router />
        </MotionLazy>
      </AntdApp>
    </AntdConfig>
  );
}

export default App;
