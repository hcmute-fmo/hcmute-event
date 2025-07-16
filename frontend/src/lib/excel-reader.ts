export const readExcelFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = e.target?.result;
        console.log(data);
    };
    reader.readAsDataURL(file);
};
