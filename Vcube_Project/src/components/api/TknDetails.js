import { decryptData } from "./cryptoUtils";

export const userTknDetails = () => {
    const decryptTkn = localStorage.getItem('encrypted_User_Token');
    if (decryptTkn){
        const token = decryptData(decryptTkn, process.env.REACT_APP_SECURITY_KEY);
        return token;
    }else {
        return stdTknDetails();
    }
}

export const stdTknDetails = () => {
    const decryptTkn = sessionStorage.getItem('encrypted_Std_Token');
    if (decryptTkn){
        const token = decryptData(decryptTkn, process.env.REACT_APP_SECURITY_KEY);
        return token;
    }else{
        return null;
    }
}

export const csrfToken = () => {
   const decryptTkn = localStorage.getItem('encrypted_CSRFToken');
   if (decryptTkn){
    const token = decryptData(decryptTkn, process.env.REACT_APP_SECURITY_KEY);
    return token;
    }else{
        return stdCsrfToken();
    }
};

export const stdCsrfToken = () => {
    const decryptTkn = sessionStorage.getItem('encrypted_StdCSRFToken');
    if (decryptTkn){
     const token = decryptData(decryptTkn, process.env.REACT_APP_SECURITY_KEY);
     return token;
     }else{
         return null;
     }
}