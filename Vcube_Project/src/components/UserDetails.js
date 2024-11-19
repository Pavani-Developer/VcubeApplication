import { decryptData } from "./api/cryptoUtils";

export const UserDetails = (type) => {
    const decryptUser = localStorage.getItem('encrypted_UserDetails');
    const decryted = sessionStorage.getItem('User_Drive_Password');
    if (decryptUser){
        const user = JSON.parse(decryptData(decryptUser, process.env.REACT_APP_SECURITY_KEY));
        if (type === 'Course')return user.Course;
        if (type === 'User')return user.User;
        if (type === 'All')return user;
        if (type === 'Drive')return decryted ? JSON.parse(decryptData(decryted, process.env.REACT_APP_SECURITY_KEY)) : null;
    }else{
        return null;
    }
}

export const is_User = () => {
    const decyrptedUser = localStorage.getItem('encryptedUser') || sessionStorage.getItem('encryptedUser');
    if (decyrptedUser){
        const user = decryptData(decyrptedUser, process.env.REACT_APP_SECURITY_KEY);
        return user;
    }else{
        return null;
    }
}

export const isUserLogin = () => {
    const decryptLogin = localStorage.getItem('encrypted_IsUserLogin');
    if (decryptLogin){
        const login = decryptData(decryptLogin, process.env.REACT_APP_SECURITY_KEY);
        return login;
    }else{
        return null;
    }
}

export const isStdLogin = () => {
    const decryptLogin = sessionStorage.getItem('encrypted_IsStdLogin');
    if (decryptLogin){
        const login = decryptData(decryptLogin, process.env.REACT_APP_SECURITY_KEY);
        return login;
    }else{
        return null;
    }
}

export const generateUniqueCode = (length = 90) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-@$';
    let result = '';

    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
        result += characters[array[i] % characters.length];
    }
    for (let i = 0; i < length; i++) {
        result += characters[array[i] % characters.length];
    }
    sessionStorage.setItem('UniqueURL',result);
}


export const generateRandomNumber = (input) => {
    return Array.from({ length: 60 }, (_, index) => {
        if ([7, 13, 25, 37, 43, 55].includes(index)) {
            return input[[7, 13, 25, 37, 43, 55].indexOf(index)];
        }
        return Math.floor(Math.random() * 10);
    }).join('');
};