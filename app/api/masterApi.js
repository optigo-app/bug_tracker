import { CommonAPI } from "../../src/utils/commonApi";
import { getClientIpAddress } from "../../utils/glocalfunc";

const getAuthData = () => {
    if (typeof window === 'undefined') return null;
    try {
        const authData = sessionStorage.getItem("AuthqueryParams");
        return authData ? JSON.parse(authData) : null;
    } catch (error) {
        return null;
    }
};

export const fetchIndidualApiMaster = async ({ mode }) => {
    try {
        const ipAddress = await getClientIpAddress();
        const authData = getAuthData();

        const body = {
            con: JSON.stringify({
                id: "",
                mode: mode,
                appuserid: authData?.uid ?? "",
                IPAddress: ipAddress
            }),
            f: "Task Management (taskmaster)",
            p: "{}",
        };

        const response = await CommonAPI(body);
        return response?.Data || [];
    } catch (error) {
        console.error('Error fetching individual master:', error);
        return [];
    }
};

export const fetchMaster = async () => {
    try {
        const ipAddress = await getClientIpAddress();
        const authData = getAuthData();

        const body = {
            "con": JSON.stringify({
                "id": "",
                "mode": "taskmaster",
                "appuserid": authData?.uid ?? "",
                "IPAddress": ipAddress
            }),
            "f": "Task Management (taskmaster)",
            "p": '{}',
        };
        const response = await CommonAPI(body);
        return response?.Data || [];
    } catch (error) {
        console.error('Error fetching master list:', error);
        return [];
    }
};

export const AssigneeMaster = async () => {
    try {
        const ipAddress = await getClientIpAddress();
        const authData = getAuthData();

        const body = {
            "con": JSON.stringify({
                "id": "",
                "mode": "taskemployee",
                "appuserid": authData?.uid ?? "",
                "IPAddress": ipAddress
            }),
            "f": "Task Management (taskmaster)",
            "p": '',
        };
        const response = await CommonAPI(body);
        if (response?.Data?.rd) {
            const sortedData = response.Data.rd.sort((a, b) => {
                const firstComp = (a?.firstname || '').localeCompare(b?.firstname || '');
                if (firstComp === 0) {
                    return (a?.lastname || '').localeCompare(b?.lastname || '');
                }
                return firstComp;
            });
            sessionStorage.setItem('taskAssigneeData', JSON.stringify(sortedData));
            return response.Data;
        } else {
            return { rd: [] };
        }
    } catch (error) {
        console.error('Error fetching assignees:', error);
        return { rd: [] };
    }
};

export const fetchMasterGlFunc = async () => {
    try {
        const AuthUrlData = getAuthData();
        const uniqueDepartments = new Set();
        let UserProfileData;
        const setUserProfileData = (data) => {
            sessionStorage.setItem('UserProfileData', JSON.stringify(data));
        };
        const AssigneeMasterData = JSON.parse(sessionStorage.getItem('taskAssigneeData'));
        if (!AssigneeMasterData) {
            const assigneeRes = await AssigneeMaster();
            const rd = assigneeRes?.rd || [];
            UserProfileData = rd.find(item => item?.userid === AuthUrlData?.uid);
            if (UserProfileData) setUserProfileData(UserProfileData);

            rd.forEach(item => {
                if (item.department) uniqueDepartments.add(item.department);
            });
        } else {
            UserProfileData = AssigneeMasterData.find(item => item?.userid === AuthUrlData?.uid) ?? {};
            setUserProfileData(UserProfileData);
            AssigneeMasterData.forEach(item => {
                if (item.department) uniqueDepartments.add(item.department);
            });
        }
        const departmentArray = Array.from(uniqueDepartments).map((department, index) => ({
            id: index + 1,
            labelname: department
        }));
        sessionStorage.setItem('taskDepartments', JSON.stringify(departmentArray));

        // Fetch taskbugstatus and taskbugpriority first
        const priorityModes = ['taskbugstatus', 'taskbugpriority'];
        for (const mode of priorityModes) {
            const apiResponse = await fetchIndidualApiMaster({ mode });
            let filteredData = apiResponse?.rd?.filter(row => row?.isdelete != 1) || [];
            filteredData.sort((a, b) => {
                if (a.displayorder !== b.displayorder) {
                    return a.displayorder - b.displayorder;
                }
                return (a.labelname || '').localeCompare(b.labelname || '');
            });
            sessionStorage.setItem(`${mode}Data`, JSON.stringify(filteredData || []));
            localStorage.setItem(`${mode}Data`, JSON.stringify(filteredData || []));
        }

        // Fetch remaining master data
        const response = await fetchMaster();
        if (response?.rd && Array.isArray(response.rd)) {
            for (const item of response.rd) {
                const { mode } = item;
                if (mode && !priorityModes.includes(mode)) {
                    const apiResponse = await fetchIndidualApiMaster({ mode });
                    let filteredData = apiResponse?.rd?.filter(row => row?.isdelete != 1) || [];
                    filteredData.sort((a, b) => {
                        if (a.displayorder !== b.displayorder) {
                            return a.displayorder - b.displayorder;
                        }
                        return (a.labelname || '').localeCompare(b.labelname || '');
                    });
                    sessionStorage.setItem(`${mode}Data`, JSON.stringify(filteredData || []));
                }
            }
        }

        return UserProfileData;
    } catch (error) {
        console.error("Error in fetchMasterGlFunc:", error);
        return null;
    }
};
