/**
 * Converts a base64 string to a Uint8Array (browser-compatible alternative to Buffer)
 */
const base64ToUint8Array = (base64: string): Uint8Array<ArrayBuffer> => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
};

export const saveFile = async (base64String: string, fileName: `${string}.${string}`, type: string) => {
    const bytes = base64ToUint8Array(base64String);
    const blob = new Blob([bytes], {
        type: type,
    });

    const extension = fileName.split('.').pop();

    if (window.showSaveFilePicker) {
        const handle = await window.showSaveFilePicker({
            suggestedName: fileName,
            types: [
                {
                    description: extension!.toUpperCase() + ' file',
                    accept: { [type]: [`.${extension}` as `.${string}`] },
                },
            ],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        writable.close();
    } else {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    }
};
