import React, { useState } from "react";

interface CloudinaryUploaderProps {
  imageUrl?: string; // allow parent to control state
  setImageUrl: (url: string) => void; // update caller state
}

const CloudinaryUploader: React.FC<CloudinaryUploaderProps> = ({
  imageUrl,
  setImageUrl,
}) => {
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Restrict file size < 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setprocessing(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "hillcrest-suites-images"); // from Cloudinary

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/dkt49dvgv/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (data.secure_url) {
        // Generate optimized URL with f_auto & q_auto
        const optimizedUrl = data.secure_url.replace(
          "/upload/",
          "/upload/f_auto,q_auto/"
        );
        setImageUrl(optimizedUrl);
      } else {
        alert("Upload failed, please try again.");
      }
    } catch (err) {
      console.error("Upload failed", err);
      alert("Something went wrong while uploading.");
    }finally{
      setprocessing(false);
    }
  };

  const [processing,setprocessing] = useState(false);

  return (
    <div className="mx-auto w-full max-w-xl">
      {/* Preview */}
      {imageUrl && (
        <div className="mt-4 w-full">
          <img
            src={imageUrl}
            alt="Uploaded"
            className="shadow-md border w-full max-h-60 object-cover"
          />
          <p className="mt-2 text-gray-500 text-xs break-all">{imageUrl}</p>
        </div>
      )}

      {/* Upload button */}
      <label className="block mt-4 mb-6 w-full">
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
          id="upload-input"
        />
        <button
          type="button"
          disabled={processing}
          onClick={() => document.getElementById("upload-input")?.click()}
          className={`bg-gray-50 hover:bg-[#008ea2]/10 shadow px-4 py-2 border-4 hover:border-[#008ea2] border-dashed rounded-lg w-full font-semibold text-gray-900 transition ${processing ? 'cursor-not-allowed opacity-75' : ''}`}
        >
          {processing ? 'Uploading image...' : 'Browse Image (max 5MB)'}
        </button>
      </label>
    </div>
  );
};

export default CloudinaryUploader;
