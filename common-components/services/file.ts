import { Buffer } from 'buffer';

export const saveFile = async (base64String: string, fileName: `${string}.${string}`, type: string) => {
    const blob = new Blob([Buffer.from(base64String, 'base64')], {
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
