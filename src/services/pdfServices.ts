import { uploadPdfToRoom } from "./roomServices";

export const uploadPdf = async (room_id: string, file_name: string, selectedFile: File, user_id: string, timestamp: string) => {
  const formData = new FormData();
  formData.append("room_id", room_id);
  formData.append("file_name", file_name);

  try {
    const res1 = await fetch("/api/pdf/get_url", {
      method: "POST",
      body: formData,
    });

    if (!res1.ok) {
      throw new Error(`Server error: ${res1.status}`);
    }

    const data = await res1.json();
    const url = data.upload_url;

    if (!url) throw new Error("No upload URL returned from backend");

    const res = await fetch(url, {
      method: "PUT",
      body: selectedFile,
    });
    console.log(res);

    if (!res.ok) {
      throw new Error(`S3 upload failed: ${res.status}`);
    }

    console.log("✅ PDF uploaded to S3");
    //make size mb
    const size = Number((selectedFile.size / 1024 / 1024).toFixed(2));
    uploadPdfToRoom(room_id, file_name, size, user_id, timestamp);
    return { success: true, url };
  } catch (err) {
    console.error("❌ Upload to AWS failed:", err);
    return { success: false, error: (err as Error).message };
  }
};

export const getPdfs = async (room_id: string) => {
  try {
    const res = await fetch(`/api/pdf/get_pdfs?room_id=${room_id}`, {
      method: "GET",
    });

    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }

    const data = await res.json();
      
    return { success: true, pdfs: { ...data } };
  } catch (err) {
    console.error("❌ Fetch PDFs failed:", err);
    return { success: false, error: (err as Error).message };
  }
};