import apiClient from '../apiClient';

import {ChatGPTShare, ClaudeShare, ProductType, Share} from '#/entity';

export enum ShareApi {
  list = '/share/list',
  add = '/share/add',
  search = '/share/search',
  delete = '/share/delete',
  update = '/share/update',
  statistic = '/share/statistic',
  chatLogin = '/login_share'
}

const getShareList = () => apiClient.get<Share[]>({ url: ShareApi.list });
const addShare = (data: Share) => apiClient.post({ url: ShareApi.add, data });
const updateShare = (data: Share) => apiClient.post({ url: ShareApi.update, data });
const deleteShare = (data: Share) => apiClient.post({ url: ShareApi.delete, data });
const searchShare = (accountType: ProductType, email?: string,uniqueName?:string ) => apiClient.post({ url: ShareApi.search, data: {
  email,
  uniqueName,
    accountType
}});
const chatLoginShare = (username: string, password: string) => apiClient.post({ url: ShareApi.chatLogin, data: {
  username,
  password
}});

type ShareStatistic = {
  series: ApexAxisChartSeries;
  categories: string[]
}

const getShareStatistic = (accountId: number) => apiClient.post<ShareStatistic>({ url: ShareApi.statistic, data: { accountId } });

export type AddShareReq = ChatGPTShare & ClaudeShare;

export default {
  getShareList,
  addShare,
  updateShare,
  searchShare,
  deleteShare,
  getShareStatistic,
  chatLoginShare
};
