import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000",
});

// ======================================================
// TOKEN HANDLER
// ======================================================

let clerkTokenGetter = null;

export const setAuthToken = (getToken) => {
  clerkTokenGetter = getToken;
};

// ======================================================
// AXIOS INTERCEPTOR
// ======================================================

API.interceptors.request.use(
  async (config) => {
    if (clerkTokenGetter) {
      const token = await clerkTokenGetter();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  },
);

// ======================================================
// CHALLENGES
// ======================================================

export const generateChallenge = (data) =>
  API.post("/challenges/generate", data);

export const getChallenge = (id) => API.get(`/challenges/${id}`);

// ======================================================
// SUBMISSIONS
// ======================================================

export const submitCode = (data) => API.post("/submissions/code", data);

export const submitBugFix = (data) => API.post("/submissions/bugfix", data);

export const submitSystemDesign = (data) =>
  API.post("/submissions/system-design", data);

// ======================================================
// HINTS
// ======================================================

export const getHint = (data) => API.post("/hints/get", data);

export const explainSolution = (data) => API.post("/hints/explain", data);

// ======================================================
// DAILY
// ======================================================

export const getDailyChallenge = () => API.get("/daily/today");

export const completeDaily = (data) => API.post("/daily/complete", data);

// ======================================================
// HISTORY
// ======================================================

export const getHistory = () => API.get("/history/me");

export const getLanguageMastery = () => API.get("/history/language-mastery");

// ======================================================
// LEADERBOARD
// ======================================================
export const syncUser = (data) => {
  return API.post("/user/sync-user", data);
};

export const getLeaderboard = () => API.get("/leaderboard/top");

export const getPointsHistory = () => API.get("/leaderboard/history");

export const getUserStats = () => API.get("/leaderboard/stats");

export default API;
