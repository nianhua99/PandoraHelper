import {useMutation, useQueryClient} from "@tanstack/react-query";
import accountService from "@/api/services/accountService.ts";
import {message} from "antd";

export const useAccountMutation = () => {

  const client = useQueryClient();

  const addAccountMutation =
    useMutation(accountService.addAccount, {
      onSuccess: () => {
        /* onSuccess */
        message.success('Add Account Success')
        client.invalidateQueries(['accounts']);
      },
    });

  const updateAccountMutation =
    useMutation(accountService.updateAccount, {
      onSuccess: () => {
        /* onSuccess */
        message.success('Update Account Success')
        client.invalidateQueries(['accounts']);
      },
    });

  const deleteAccountMutation = (onSettled: VoidFunction) =>
    useMutation(accountService.deleteAccount, {
      onSuccess: () => {
        /* onSuccess */
        message.success('Delete Account Success')
        client.invalidateQueries(['accounts']);
      },
      onSettled: () => {
        onSettled()
      }
    });

  const refreshAccountMutation = (onSettled: VoidFunction) =>
    useMutation(accountService.refreshAccount, {
      onSuccess: () => {
        /* onSuccess */
        message.success('Refresh Account Success')
        client.invalidateQueries(['accounts']);
      },
      onSettled: () => {
        onSettled()
      }
    });

  return {
    addAccountMutation,
    updateAccountMutation,
    deleteAccountMutation,
    refreshAccountMutation,
  }
}
