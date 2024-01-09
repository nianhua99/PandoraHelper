import apiClient from '../apiClient';

import {Share} from '#/entity';

export enum AccountApi {
  list = '/share/list',
  add = '/share/add',
  search = '/share/search',
}

const getShareList = () => apiClient.get<Share[]>({ url: AccountApi.list });
const addShare = (data: Share) => apiClient.post({ url: AccountApi.add, data });
const searchShare = (email?: string,uniqueName?:string ) => apiClient.post({ url: AccountApi.search, data: {
  email,
  uniqueName
}});

export default {
  getShareList,
  addShare,
  searchShare,
};
