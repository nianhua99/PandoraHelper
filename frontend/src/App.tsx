import { App as AntdApp } from 'antd';

import Router from '@/router/index';
import AntdConfig from '@/theme/antd';


import { MotionLazy } from './components/animate/motion-lazy';
import { Inspector } from 'react-dev-inspector';

function App() {
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
