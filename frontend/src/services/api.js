import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000",
});

// Challenges
export const generateChallenge = (data) =>
  API.post("/challenges/generate", data);

export const getChallenge = (id) => API.get(`/challenges/${id}`);

// Submissions
export const submitCode = (data) => API.post("/submissions/code", data);

export const submitBugFix = (data) => API.post("/submissions/bugfix", data);

export const submitSystemDesign = (data) =>
  API.post("/submissions/system-design", data);

// Hints & Explanations
export const getHint = (data) => API.post("/hints/get", data);

export const explainSolution = (data) => API.post("/hints/explain", data);

// Daily Challenge
export const getDailyChallenge = (clerkId) =>
  API.get(`/daily/today?clerk_id=${clerkId}`);

export const completeDaily = (clerkId, challengeId) =>
  API.post(`/daily/complete?clerk_id=${clerkId}&challenge_id=${challengeId}`);

// History & Mastery
export const getHistory = (clerkId) => API.get(`/history/${clerkId}`);

export const getLanguageMastery = (clerkId) =>
  API.get(`/history/language-mastery/${clerkId}`);

// Leaderboard & Stats
export const getLeaderboard = () => API.get("/leaderboard/top");

export const getPointsHistory = (clerkId) =>
  API.get(`/leaderboard/history/${clerkId}`);

export const getUserStats = (clerkId) =>
  API.get(`/leaderboard/stats/${clerkId}`);

export default API;
