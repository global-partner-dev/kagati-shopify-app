/**
 * DropZoneComponent
 * 
 * This component is a customizable file upload area using Shopify's Polaris DropZone. It allows users to drag and drop files for uploading,
 * and it handles file uploads with progress tracking. Uploaded files are displayed with thumbnails, and the component supports integration
 * with a backend service for direct file uploads.
 * 
 * @param {string} DropZoneName - The name identifier for the drop zone, used when returning the uploaded files in the onValueChange callback.
 * @param {function} onValueChange - Callback function that is triggered when files are successfully uploaded. It receives an object containing
 *                                   the DropZoneName and an array of uploaded image records.
 * 
 * @returns {JSX.Element} A drop zone component with file upload and thumbnail preview functionality.
 */

import {
  DropZone,
  BlockStack,
  InlineStack,
  Thumbnail,
  Text,
} from "@shopify/polaris";
import { NoteIcon } from "@shopify/polaris-icons";
import { useState, useCallback } from "react";
import { api } from "../api";

const DropZoneComponent = ({ DropZoneName, onValueChange }) => {
  const [files, setFiles] = useState([]);

  // Handle the drop event, upload files, and update the state with uploaded files
  const handleDropZoneDrop = useCallback(
    async (_dropFiles, acceptedFiles, _rejectedFiles) => {
      try {
        // Add the accepted files to the local state
        setFiles((files) => [...files, ...acceptedFiles]);

        // Create an array of upload tasks for each file
        const uploadTasks = acceptedFiles.map(async (file) => {
          // Get the direct upload URL and token from the API
          const { url, token } = await api.getDirectUploadToken();

          // Upload the file to the direct upload URL
          await fetch(url, {
            method: 'PUT',
            headers: {
              'Content-Type': file.type,
            },
            body: file,
          });

          // Create a record for the uploaded image in the backend
          const imageRecord = await api.khagatiTemporyImage.create({
            name: file.name,
            src: {
              directUploadToken: token,
              fileName: file.name,
            },
          });

          return imageRecord;
        });

        // Wait for all upload tasks to complete and get the uploaded images
        const images = await Promise.all(uploadTasks);

        // Call the onValueChange callback with the uploaded images
        onValueChange({
          name: DropZoneName,
          value: images,
        });
      } catch (error) {
        console.error('Error handling file upload:', error);
      }
    },
    [onValueChange, DropZoneName]
  );

  // Valid image MIME types for thumbnail display
  const validImageTypes = ["image/gif", "image/jpeg", "image/png"];

  // Display the file upload prompt if no files have been uploaded
  const fileUpload = !files.length && <DropZone.FileUpload />;

  // Display thumbnails for uploaded files
  const uploadedFiles = files.length > 0 && (
    <div style={{ padding: "0" }}>
      <BlockStack>
        {files.map((file, index) => (
          <InlineStack alignment="center" key={index}>
            <Thumbnail
              size="small"
              alt={file.name}
              source={
                validImageTypes.includes(file.type)
                  ? window.URL.createObjectURL(file)
                  : NoteIcon
              }
            />
            <div>
              {file.name}{" "}
              <Text variant="bodySm" as="p">
                {file.size} bytes
              </Text>
            </div>
          </InlineStack>
        ))}
      </BlockStack>
    </div>
  );

  return (
    <DropZone onDrop={handleDropZoneDrop}>
      {uploadedFiles}
      {fileUpload}
    </DropZone>
  );
};

export default DropZoneComponent;