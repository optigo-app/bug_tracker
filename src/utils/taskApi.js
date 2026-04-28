import axios from 'axios';
import { UPLOAD_URL, REMOVE_FILE_URL } from "./apiConfig";
import { CommonAPI } from './commonApi';

export const removeFileApi = async ({ attachments }) => {
  const data = {
    imageUrl: attachments,
  };
  try {
    const response = await axios.post(REMOVE_FILE_URL, data, {
      headers: {
        'Content-Type': 'application/json',
      },
      maxBodyLength: Infinity,
    });
    return response;
  } catch (error) {
    console.error('File remove failed:', error);
  }
};

export const filesUploadApi = async ({ attachments, folderName, uniqueNo }) => {
  const authParams = JSON.parse(sessionStorage.getItem('AuthqueryParams') || '{}');
  const ukey = authParams.ukey || "";
  const formData = new FormData();

  attachments?.forEach((item) => {
    if (item.file) {
      formData.append('fileType', item.file); // File
    } else if (item.url) {
      formData.append('urls', item.url); // Optional: URL
    }
  });

  formData.append('folderName', folderName);
  formData.append('uKey', ukey);
  formData.append('uniqueNo', uniqueNo);

  try {
    const response = await axios.post(UPLOAD_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('File upload failed:', error);
    throw error;
  }
};

export const fetchTaskDataFullApi = async (params = {}) => {
  try {
    const authData = JSON.parse(sessionStorage.getItem("AuthqueryParams") || "{}");

    const body = {
      "con": JSON.stringify({
        "id": "",
        "mode": "tasknolist",
        "appuserid": authData?.uid || ""
      }),
      "p": '{}',
      "f": "Task Management (taskmaster)"
    };

    const response = await CommonAPI(body, "6");
    return response?.Data || { rd: [] };
  } catch (error) {
    console.error("Error fetching task data:", error);
    return { rd: [] };
  }
};
