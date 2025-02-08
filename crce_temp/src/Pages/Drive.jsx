import React, { useState } from "react";
import axios from "axios";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [folderLink, setFolderLink] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file || !folderLink) {
      setUploadStatus("Please select a file and provide a Drive folder link.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    const folderId = folderLink.split("/").pop(); // Extracts ID from link
formData.append("folderId", folderId);

    try {
      const response = await axios.post("http://localhost:3000/upload", formData);
      setUploadStatus(`File uploaded successfully! File ID: ${response.data.fileId}`);
    } catch (error) {
      setUploadStatus("Upload failed. Please try again.");
    }
  };

  return (
    <div className="p-6 border rounded-md shadow-md w-96 mx-auto mt-10">
      <h2 className="text-xl font-semibold mb-4">Upload File to Google Drive</h2>
      
      <input
        type="text"
        placeholder="Enter Google Drive Folder Link"
        value={folderLink}
        onChange={(e) => setFolderLink(e.target.value)}
        className="border p-2 w-full mb-4"
      />

      <input type="file" onChange={handleFileChange} className="mb-4" />

      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Upload
      </button>

      {uploadStatus && <p className="mt-4 text-sm">{uploadStatus}</p>}
    </div>
  );
};

export default FileUpload;