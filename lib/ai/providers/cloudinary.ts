export type CloudinaryUploadRequest = {
  file: unknown;
  folder?: string;
};

export async function cloudinaryUpload(
  _request: CloudinaryUploadRequest,
): Promise<{
  url: string;
}> {
  throw new Error("Cloudinary todavía no está conectado.");
}
