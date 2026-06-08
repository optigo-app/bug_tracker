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

export const bugApi = async (mode, params = {}) => {
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
            f: "Bug Management (bugmaster)",
            p: JSON.stringify(params.p || {}),
        };

        const response = await CommonAPI(body, "146", "v1");
        return response?.Data || {};
    } catch (error) {
        console.error(`Error in ${mode} API:`, error);
        return {};
    }
};
