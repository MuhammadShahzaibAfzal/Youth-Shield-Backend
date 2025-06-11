export interface FileData {
  fileName: string;
  fileData: ArrayBuffer;
  contentType?: string;
}

export interface FileStorage {
  upload(data: FileData): Promise<string>;
  delete(fileName: string): Promise<void>;
}
