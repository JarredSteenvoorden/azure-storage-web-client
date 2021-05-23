<template>
  <v-container>
    <div class="text-h2">{{ config.header }}</div>

    <div>
      <router-link v-for="crumb in breadcrumbs" :key="crumb.link" :to="crumb.link">/{{ crumb.text }}</router-link>
    </div>

    <v-data-table
        :loading="loading"
        :headers="headers"
        :items="desserts"
        :items-per-page="-1"
        :hide-default-footer="true"
        class="elevation-1"
        loading-text="Loading..."
    >
      <template v-slot:item.name="{item}">
        <router-link v-if="item.isFolder" :to="`/${item.containerName}/${item.prefix}`">{{ item.name }}</router-link>
        <a v-if="!item.isFolder" :href="`${config.downloadUri}/${item.containerName}/${item.prefix}`">{{ item.name }}</a>
      </template>
      <template v-slot:item.size="{item}">
        <div>{{ !item.isFolder ? humanFileSize(item.size) : null }}</div>
      </template>
      <template v-slot:item.lastModified="{item}">
        <div>{{ !item.isFolder ? format(item.lastModified, 'yyyy-MM-dd hh:mm:ss a') : null }}</div>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-icon v-if="!item.isFolder" small class="mr-2" @click="copyToClipboard(item.prefix)">mdi-link</v-icon>
      </template>
    </v-data-table>

    <v-snackbar
        v-model="snackbar"
        timeout="2000"
    > Copied to clipboard
    </v-snackbar>
  </v-container>
</template>

<script>
  const { BlobServiceClient } = require("@azure/storage-blob");
  import { format } from 'date-fns'

  let blobServiceClient = null;

  export default {
    name: 'HelloWorld',

    watch: {
      $route(to) {
        this.loadPath(to.path);
      }
    },

    async mounted() {
      const runtimeConfig = await fetch('/config.json')
      this.config = await runtimeConfig.json();

      blobServiceClient = new BlobServiceClient(this.config.connectionString);

      await this.loadPath(this.$route.path);
    },

    methods: {
      async loadPath(path) {
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
          await this.listContainers();
        else
          await this.listBlobs(containerName, prefix)
      },

      async listContainers() {
        //let containers = blobServiceClient.listContainers();
        let containers = [
          {name: 'library-software'},
          {name: 'public'},
          {name: 'support'},
          {name: 'temp'},
        ]

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
        if (!prefix || prefix === '' || prefix === '/')
          prefix = null;

        this.loading = true

        const containerClient = blobServiceClient.getContainerClient(containerName);
        let blobs = containerClient.listBlobsByHierarchy('/', {prefix: prefix});

        this.desserts = [];
        for await (const blob of blobs) {
          this.desserts.push({
            containerName: containerName,
            prefix: blob.name,
            isFolder: blob.kind === "prefix",

            name: blob.name.replace(prefix, '').replace('/', ''),
            size: blob.properties?.contentLength,
            lastModified: blob.properties?.lastModified
          });
        }

        this.loading = false
      },

      copyToClipboard(text) {
        this.snackbar = true

        let dummy = document.createElement("textarea");
        // to avoid breaking orgain page when copying more words
        // cant copy when adding below this code
        // dummy.style.display = 'none'
        document.body.appendChild(dummy);
        //Be careful if you use texarea. setAttribute('value', value), which works with "input" does not work with "textarea". – Eduard
        dummy.value = text;
        dummy.select();
        document.execCommand("copy");
        document.body.removeChild(dummy);
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
        config: {
          header: null,
          connectionString: null,
          containers: [],
          downloadUri: null
        },
        breadcrumbs: [],
        loading: false,
        snackbar: false,
        headers: [
          { text: 'Name', value: 'name' },
          { text: 'Size', value: 'size', width: 100 },
          { text: 'Last Modified', value: 'lastModified', width: 200 },
          { text: 'Actions', value: 'actions', sortable: false, width: 100 }
        ],
        desserts: [ ],
      }
    },
  }
</script>
