export const uploadPdf = async(room_id: string, file_name: string, selectedFile: File) => {
    const formData = new FormData();
    formData.append("room_id",room_id);
    formData.append("file_name",file_name);

    try{
        const res1 = await fetch("/upload_pdf", {
            method: "POST",
            body: formData
        });

        if(!res1.url) throw new Error(`Server error`)

        
        const res = await fetch(`${res1.url}`, {
            method: "PUT",
            body: selectedFile,
        });
    }
    catch (err) {
      console.error("❌ Upload to aws failed:", err);
    }
}