import apiClient from '../apiClient';

export enum SysApi {
  pandoraUsage = '/sys_info/usage',
  setting = '/sys_info/info',
  getMfaSecret = '/user/2fa_secret',
  verifyMfa = '/user/2fa_verify',
}

export type PandoraUsage = {
  total: number;
  current: number;
  ttl: number;
};

const getMfaSecretUrl = () => apiClient.get({ url: SysApi.getMfaSecret });
const verifyMfa = (code: string,secret: string) => apiClient.post({ url: SysApi.verifyMfa, params: { code, secret } });
const getPandoraUsage = () => apiClient.get<PandoraUsage>({ url: SysApi.pandoraUsage });
const getSetting = () => apiClient.get({ url: SysApi.setting });

export default {
  getPandoraUsage,
  getSetting,
  getMfaSecretUrl,
  verifyMfa
};
