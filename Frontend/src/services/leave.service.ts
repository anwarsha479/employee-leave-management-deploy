import type { AxiosRequestConfig } from "axios";
import api from "../api/axios";

export const getLeaves = (
  search = "",
  limit = 10,
  offset = 0,
  chunk = 10,
  sortBy = "",
  sortOrder = "",
  status = "",
  config?: AxiosRequestConfig,
) => {
  let url = `/leaves?search=${search}&limit=${limit}&offset=${offset}&chunk=${chunk}`;
  if (sortBy) {
    url += `&sortBy=${sortBy}`;
  }
  if (sortOrder) {
    url += `&sortOrder=${sortOrder}`;
  }
  if (status) {
    url += `&status=${status}`;
  }
  return api.get(url, config);
};

export const createLeave = (data: any) => {
  return api.post("/leaves", data);
};

export const approveLeave = (id: string) => {
  return api.post(`/leaves/${id}/approve`);
};

export const rejectLeave = (id: string) => {
  return api.post(`/leaves/${id}/reject`);
};

export const exportLeaves = () => {
  return api.get("/leaves/export", {
    responseType: "blob",
  });
};
