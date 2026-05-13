export const saveFile = async (
    fileUrl: string,
    fileName: `${string}.${string}`,
) => {
    const iframe = document.createElement('iframe');
    // Cross-origin signed URLs can ignore the download attribute and navigate instead.
    // Running the click inside an iframe keeps that navigation away from the parent app.
    // This avoids triggering the parent app's beforeunload handler during file downloads.
    iframe.title = 'File download';
    iframe.dataset.fileDownloadFrame = 'true';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const iframeDocument = iframe.contentDocument;

    if (!iframeDocument) {
        iframe.remove();
        return;
    }

    const a = iframeDocument.createElement('a');
    a.href = fileUrl;
    a.download = fileName;
    iframeDocument.body.appendChild(a);
    a.click();

    setTimeout(() => {
        iframe.remove();
    }, 1000);
};
