import api from "./api";

export const uploadToImageKit = async (file) => {
  try {
    // 1. Get auth params from backend
    const authRes = await api.get("/auth/imagekit");
    const { signature, expire, token } = authRes.data;

    // 2. Prepare FormData
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", file.name || "upload.jpg");
    formData.append("publicKey", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY);
    formData.append("signature", signature);
    formData.append("expire", expire);
    formData.append("token", token);

    // 3. Upload directly to ImageKit
    const uploadRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
      method: "POST",
      body: formData,
    });

    if (!uploadRes.ok) {
      const errorData = await uploadRes.json();
      throw new Error(errorData.message || "Failed to upload image");
    }

    const data = await uploadRes.json();
    return {
      url: data.url,
      fileId: data.fileId,
    };
  } catch (error) {
    console.error("ImageKit Upload Error:", error);
    throw error;
  }
};
