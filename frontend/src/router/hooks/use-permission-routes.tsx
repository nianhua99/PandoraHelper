import { useMemo } from 'react';
import {getRoutesFromModules} from "@/router/utils.ts";

/**
 * return routes about permission
 */
export function usePermissionRoutes() {
  // 切换回静态路由
  return useMemo(() => {
    return getRoutesFromModules();
  }, []);
}
