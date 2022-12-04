import type {BlobItem, BlobPrefix} from "@azure/storage-blob";

export class StorageItem {
  containerName: string = '';
  prefix: string = '';
  isFolder: boolean = false;

  name: string = '';
  size?: number;
  lastModified?: Date;

  getLink(): string {
    return `/${this.containerName}/${this.prefix}`
  }

  static fromContainerName(containerName: string): StorageItem {
    const item = new StorageItem();

    item.containerName = containerName;
    item.prefix = '';
    item.isFolder = true;

    item.name = containerName;
    item.size = undefined;
    item.lastModified = undefined;

    return item;
  }

  static fromBlobPrefix(blobPrefix: BlobPrefix, containerName: string, prefix?: string): StorageItem {
    const item = new StorageItem();

    item.containerName = containerName;
    item.prefix = blobPrefix.name;
    item.isFolder = true;

    item.name = blobPrefix.name.replace(prefix ?? '', '').replace('/', '');
    item.size = undefined;
    item.lastModified = undefined;

    return item;
  }

  static fromBlobItem(blobItem: BlobItem, containerName: string, prefix?: string): StorageItem {
    const item = new StorageItem();

    item.containerName = containerName;
    item.prefix = blobItem.name;
    item.isFolder = false;

    item.name = blobItem.name.replace(prefix ?? '', '').replace('/', '');
    item.size = blobItem.properties.contentLength;
    item.lastModified = blobItem.properties.lastModified;

    return item;
  }
}