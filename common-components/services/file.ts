export const saveFile = async (
    fileUrl: string,
    fileName: `${string}.${string}`,
) => {
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
};
