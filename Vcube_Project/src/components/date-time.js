export const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const DateTime = () => {

    const now = new Date();

    const day = now.getDate();
    const monthName = months[now.getMonth()];
    const year = now.getFullYear();

    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    return `${day < 10 ? `0${day}` : day}-${monthName}-${year} ${hours}:${minutes}:${seconds}`;
}