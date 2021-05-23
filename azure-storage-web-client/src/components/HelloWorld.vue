<template>
  <v-container>
    <v-data-table
        :headers="headers"
        :items="desserts"
        :items-per-page="-1"
        :hide-default-footer="true"
        class="elevation-1"
    >
      <template v-slot:item.name="{item}">
        <router-link :to="`/${item.containerName}/${item.prefix}`">{{item.name}}</router-link>
      </template>
      <template v-slot:item.size="{item}">
        <div>{{!item.isFolder ? humanFileSize(item.size) : null}}</div>
      </template>
      <template v-slot:item.lastModified="{item}">
        <div>{{!item.isFolder ? format(item.lastModified, 'yyyy-MM-dd hh:mm:ss a') : null}}</div>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
  const { BlobServiceClient } = require("@azure/storage-blob");
  import { format } from 'date-fns'

  const connectionString = 'ENTER_CONNECTION_STRING';
  const blobServiceClient = new BlobServiceClient(connectionString);

  export default {
    name: 'HelloWorld',

    watch: {
      $route(to) {
        this.loadPath(to.path);
      }
    },

    async mounted() {
      await this.loadPath(this.$route.path);
    },

    methods: {
      async loadPath(path) {
        let containerName = path.split('/')[1];
        let prefix = path.split('/').slice(2, -1).join('/') + '/';
        if (prefix === '/') prefix = '';

        if (!containerName)
          await this.listContainers();
        else
          await this.listBlobs(containerName, prefix)
      },

      async listContainers() {
        let containers = blobServiceClient.listContainers();

        this.desserts = [];
        for await (const container of containers) {
          this.desserts.push({
            containerName: container.name,
            prefix: '',
            isFolder: true,

            name: container.name,
            size: null,
            lastModified: null
          })
        }
      },

      async listBlobs(containerName, prefix = null) {
        if (prefix === '')
          prefix = null;

        const containerClient = blobServiceClient.getContainerClient(containerName);
        let blobs = containerClient.listBlobsByHierarchy('/', {prefix: prefix});

        this.desserts = [];
        for await (const blob of blobs) {
          this.desserts.push({
            containerName: containerName,
            prefix: blob.name,
            isFolder: blob.kind === "prefix",

            name: blob.name.replace(prefix, ''),
            size: blob.properties?.contentLength,
            lastModified: blob.properties?.lastModified
          });
        }
      },

      humanFileSize(bytes, si) {
        if (si === undefined) si = true;

        let thresh = si ? 1000 : 1024;
        if(Math.abs(bytes) < thresh) {
          return bytes + ' B';
        }
        let units = si
            ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
            : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
        let u = -1;
        do {
          bytes /= thresh;
          ++u;
        } while(Math.abs(bytes) >= thresh && u < units.length - 1);

        return bytes.toFixed(1) + ' ' + units[u];
      }
    },

    data () {
      return {
        format,
        headers: [
          { text: 'Name', value: 'name' },
          { text: 'Size', value: 'size' },
          { text: 'Last Modified', value: 'lastModified' }
        ],
        desserts: [ ],
      }
    },
  }
</script>
