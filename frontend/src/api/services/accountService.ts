import apiClient from '../apiClient';

import { Account } from '#/entity';

export enum AccountApi {
  list = '/account/list',
  add = '/account/add',
  update = '/account/update',
  delete = '/account/delete',
  refresh = '/account/refresh',
  search = '/account/search',
}

const getAccountList = () =>
  apiClient.get<Account[]>({ url: AccountApi.list }).then((res) => {
    // 将shareList转为json对象
    res.forEach((item) => {
      if (item.shareList) {
        item.shareList = JSON.parse(item.shareList);
      }
    });
    return res;
  });

const searchAccountList = (email: string) =>
  apiClient.post<Account[]>({ url: AccountApi.search, data: { email } }).then((res) => {
    // 将shareList转为json对象
    res.forEach((item) => {
      if (item.shareList) {
        item.shareList = JSON.parse(item.shareList);
      }
    });
    return res;
  });
export interface AccountAddReq {
  id?: number;
  email: string;
  password?: string;
  shared?: number;
  refreshToken?: string;
  accessToken?: string;
}
const addAccount = (data: AccountAddReq) => apiClient.post({ url: AccountApi.add, data });
const updateAccount = (data: AccountAddReq) => apiClient.post({ url: AccountApi.update, data });
const deleteAccount = (id: number) => apiClient.post({ url: AccountApi.delete, data: { id } });
const refreshAccount = (id: number) => apiClient.post({ url: AccountApi.refresh, data: { id } });

export default {
  getAccountList,
  searchAccountList,
  addAccount,
  updateAccount,
  deleteAccount,
  refreshAccount,
};
