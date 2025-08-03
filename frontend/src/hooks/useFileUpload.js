import { useState, useRef, useCallback } from 'react';

export const useFileUpload = (options = {}) => {
  const {
    multiple = false,
    accept = '*/*',
    maxSize = 10 * 1024 * 1024, // 10MB
    maxFiles = 5,
    onUpload,
    onError
  } = options;

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const validateFile = useCallback((file) => {
    if (file.size > maxSize) {
      onError?.(`File "${file.name}" is too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`);
      return false;
    }
    return true;
  }, [maxSize, onError]);

  const addFiles = useCallback((newFiles) => {
    const validFiles = Array.from(newFiles).filter(validateFile);

    if (!multiple && validFiles.length > 1) {
      validFiles.splice(1);
    }

    setFiles(prevFiles => {
      const totalFiles = multiple ? [...prevFiles, ...validFiles] : validFiles;

      if (totalFiles.length > maxFiles) {
        onError?.(`Maximum ${maxFiles} files allowed.`);
        return totalFiles.slice(0, maxFiles);
      }

      return totalFiles;
    });
  }, [multiple, maxFiles, validateFile, onError]);

  const removeFile = useCallback((index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setProgress(0);
  }, []);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback((event) => {
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      addFiles(selectedFiles);
    }
    // Reset input value to allow selecting same file again
    event.target.value = '';
  }, [addFiles]);

  const uploadFiles = useCallback(async () => {
    if (files.length === 0 || !onUpload) return;

    setUploading(true);
    setProgress(0);

    try {
      const uploadPromises = files.map((file, index) => {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const fileProgress = (event.loaded / event.total) * 100;
              const totalProgress = ((index * 100) + fileProgress) / files.length;
              setProgress(Math.round(totalProgress));
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(xhr.response);
            } else {
              reject(new Error(`Upload failed: ${xhr.statusText}`));
            }
          });

          xhr.addEventListener('error', () => {
            reject(new Error('Upload failed'));
          });

          onUpload(file, xhr);
        });
      });

      const results = await Promise.all(uploadPromises);
      setProgress(100);
      return results;
    } catch (error) {
      onError?.(error.message);
      throw error;
    } finally {
      setUploading(false);
    }
  }, [files, onUpload, onError]);

  const getRootProps = useCallback(() => ({
    onClick: openFileDialog
  }), [openFileDialog]);

  const getInputProps = useCallback(() => ({
    ref: fileInputRef,
    type: 'file',
    multiple,
    accept,
    onChange: handleFileInputChange,
    style: { display: 'none' }
  }), [multiple, accept, handleFileInputChange]);

  const isDragActive = false; // This would need drag & drop implementation

  return {
    files,
    uploading,
    uploadProgress: progress,
    handleFileSelect: addFiles,
    removeFile,
    resetFiles: clearFiles,
    uploadFiles,
    openFileDialog,
    getRootProps,
    getInputProps,
    isDragActive
  };
};

export default useFileUpload;
