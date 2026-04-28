import axios from "axios";
import { APIURL, getHeaders } from "./apiConfig";

export const CommonAPI = async (body, sp = "6", version) => {
  if (typeof window === 'undefined') return null;
  try {
    let init = {};
    if (typeof window !== 'undefined') {
      init = JSON.parse(sessionStorage.getItem("AuthqueryParams") || "{}");
    }
    const headers = getHeaders({ ...init, sp, version });

    const { data } = await axios.post(APIURL, body, { headers });
    return data;
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
};
