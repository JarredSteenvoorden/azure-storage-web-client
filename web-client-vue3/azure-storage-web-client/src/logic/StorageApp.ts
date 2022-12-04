import type {Config} from "@/logic/Config";
import {BlobServiceClient} from "@azure/storage-blob";
import type {Breadcrumb} from "@/logic/Breadcrumb";
import {StorageItem} from "@/logic/StorageItem";

export class StorageApp {
  config: Config;

  breadcrumbs: Array<Breadcrumb>;
  blobServiceClient!: BlobServiceClient;

  constructor() {
    this.config = {} as Config;
    this.breadcrumbs = [];
  }

  async initialise() {
    const runtimeConfig = await fetch('/config.json');
    this.config = await runtimeConfig.json();

    this.blobServiceClient = new BlobServiceClient(this.config.connectionString);
  }

  async getFromPath(path: string): Promise<Array<StorageItem>> {
    // Make sure last character of path is /
    if (path.slice(-1) !== '/')
      path += '/'

    // Build breadcrumbs
    this.breadcrumbs = [{ text: 'home', link: '/' }];

    let parts = path.split('/').slice(1, -1)
    for(let i = 0; i < parts.length; i++ ) {
      this.breadcrumbs.push({
        text: parts[i],
        link: '/' + parts.slice(0, i + 1).join('/') + '/'
      });
    }

    // Get containers / blobs
    let containerName = path.split('/')[1];
    let prefix = path.split('/').slice(2, -1).join('/') + '/';

    if (!containerName)
      return await this.getContainers();
    else
      return await this.getBlobs(containerName, prefix)
  }

  private async getContainers(): Promise<Array<StorageItem>> {
    //let containers = blobServiceClient.listContainers();
    let containers = this.config.containers;

    const items = [];
    for await (const container of containers) {
      items.push(StorageItem.fromContainerName(container));
    }

    return items;
  }

  private async getBlobs(containerName: string, prefix?: string): Promise<Array<StorageItem>> {
    if (!prefix || prefix === '' || prefix === '/')
      prefix = undefined;

    const containerClient = this.blobServiceClient.getContainerClient(containerName);
    let blobs = containerClient.listBlobsByHierarchy('/', {prefix: prefix});

    const items = [];
    for await (const blob of blobs) {
      items.push(blob.kind === "prefix" ?
        StorageItem.fromBlobPrefix(blob, containerName, prefix) :
        StorageItem.fromBlobItem(blob, containerName, prefix));
    }

    return items;
  }
}