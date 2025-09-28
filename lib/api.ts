import axios from "axios";
import { getSession } from "next-auth/react";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// Create axios instance
export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const session = await getSession();
      const token = session?.accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting session:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API functions
export const employeeApi = {
  getAll: () => api.get("/user/all-profile"),
  invite: (data: { email: string; message: string }) =>
    api.post("/user/invite-user", data),
  getRating: (userId: string) => api.get(`/user/${userId}/rating`),
  updateRating: (userId: string, data: any) =>
    api.put(`/user/${userId}/rating`, data),
};

export const managerApi = {
  getAll: () => api.get("/user/manager-profile"),
  add: (data: any) => api.post("/user/add-manager", data),
  delete: (id: string) => api.delete(`/user/delete-manager/${id}`),
};

export const cvApi = {
  getAll: () => api.get("/cv"),
};

export const locationApi = {
  getAll: () => api.get("/location"),
  add: (data: any) => api.post("/location", data),
  update: (id: string, data: any) => api.patch(`/location/${id}`, data),
  delete: (id: string) => api.delete(`/location/${id}`),
};

export const availabilityApi = {
  getAll: (params?: any) => api.get("/availability", { params }),
};

export const shiftApi = {
  getAll: (params?: any) => api.get("/shifts", { params }),
  getRequests: (params?: any) => api.get("/shift-request", { params }),
  updateRequestStatus: (id: string, data: { status: string }) =>
    api.patch(`/shift-request/${id}/status`, data),
  // Add delete function
  deleteRequest: (id: string) => api.delete(`/shift-request/${id}`),
  // ... other functions
  getLocations: () => api.get("/location"),
  getEmployees: () => api.get("/user/all-profile"),
  getShiftTypes: () => api.get("/shift-type"),
  createShift: (data: any) => api.post("/shifts/assign", data),
  updateShift: (id: string, data: any) => api.patch(`/shifts/${id}`, data),
  deleteShift: (id: string) => api.delete(`/shifts/${id}`),
};

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  forgotPassword: (data: { email: string }) => api.post("/auth/forget", data),
  resetPassword: (data: { password: string; otp: string; email: string }) =>
    api.post("/auth/reset-password", data),
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    api.post("/auth/change-password", data),
  getProfile: () => api.get("/user/profile"),
};

export const chatApi = {
  createChat: (data: { participantId: string }) =>
    api.post("/chat/create", data),
  createGroupChat: (data: { participantIds: string[]; title: string }) =>
    api.post("/chat/create-group", data),
  getChats: () => api.get("/chat/list"),
  getMessages: (chatId: string) => api.get(`/chat/messages/${chatId}`),
  sendMessage: (data: {
    chatId: string;
    content: string;
    contentType?: string;
  }) => api.post("/chat/send", data),
  addToGroup: (data: { chatId: string; userId: string }) =>
    api.post("/chat/add-to-group", data),
  removeFromGroup: (data: { chatId: string; userId: string }) =>
    api.post("/chat/remove-from-group", data),
  leaveGroup: (chatId: string) => api.delete(`/chat/leave-group/${chatId}`),
};