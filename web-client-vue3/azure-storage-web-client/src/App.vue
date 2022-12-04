<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import TheWelcome from './components/TheWelcome.vue'
</script>

<template>
  <q-layout>
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>
          files.fetechgroup.com
        </q-toolbar-title>
      </q-toolbar>
    </q-header>


    <q-page-container>
      <q-page>

        <div class="q-pa-md">
          <q-table
              class="filelist-table"
              title="Treats"
              flat dense

              :rows="items"

              row-key="name"

              :filter="search"
              :loading="loading"

              v-model:pagination="pagination"
              :rows-per-page-options="[0]"
          >
            <template v-slot:top>
              <div>
                <a v-for="crumb in breadcrumbs" :key="crumb.link" :href="`#${crumb.link}`">/{{ crumb.text }}</a>
              </div>
              <q-space />
              <div class="q-pa-md q-gutter-sm">
                <q-input dense v-model="search" label="Search (this page)">
                  <template v-slot:append>
                    <q-icon name="search" />
                  </template>
                </q-input>

                <q-btn dense round color="primary" icon="arrow_left" @click="back()" />
                <q-btn dense round color="primary" icon="refresh" @click="refresh()" />
              </div>
            </template>

            <template v-slot:body-cell-name="props">
              <q-td :props="props">
                <a v-if="props.row.isFolder" :href="`#${props.row.getLink()}`">{{ props.row.name }}</a>
                <a v-if="!props.row.isFolder" :href="`${storageApp.config.downloadUri}/${props.row.getLink()}`">{{ props.row.name }}</a>
              </q-td>
            </template>

            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn v-if="!props.row.isFolder" dense flat round color="primary" icon="link" @click="copyToClipboard(`${storageApp.config.downloadUri}/${props.row.getLink()}`)" />
              </q-td>
            </template>
          </q-table>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style>
@import './assets/base.css';
@import 'logic/Config.ts';

#app {
  max-width: 1280px;
  /*margin: 0 auto;
  padding: 2rem;

  font-weight: normal;*/
}
</style>

<script lang="ts">
import {defineComponent, ref} from 'vue'
import {StorageApp} from "@/logic/StorageApp";
import type {StorageItem} from "@/logic/StorageItem";
import type {Breadcrumb} from "@/logic/Breadcrumb";
import {useQuasar} from "quasar";

const columnDef = [
  {
    name: 'name',
    label: 'Name',
    align: 'left',

    field: 'name',
    sortable: true
  },
  {
    name: 'size', label: 'Size', align: 'right', field: 'size', sortable: true
  },
  {
    name: 'lastModified', align: 'right', label: 'Last Modified', sortable: true,
    field: 'lastModified',
    format: (val: Date) => val?.toDateString()
  },
  { name: 'actions', label: 'Actions', align: 'right' }
]

export default defineComponent({
  data() {
    const $q = useQuasar();

    return {
      storageApp: new StorageApp(),

      columns: columnDef,
      pagination: ref({
        rowsPerPage: 0
      }),

      breadcrumbs: [] as Array<Breadcrumb>,
      items: [] as Array<StorageItem>,

      search: '',
      loading: true
    }
  },
  async mounted() {
    window.addEventListener('hashchange', () => {
      this.loadPath();
    })

    await this.storageApp.initialise();
    await this.loadPath();
  },
  methods: {
    async back() { history.back(); },
    async refresh() { await this.loadPath(); },

    async loadPath(path?: string) {
      if (!path) {
        path = decodeURI(window.location.hash);
      }

      this.loading = true;

      this.items = [];
      this.items = await this.storageApp.getFromPath(path);
      this.breadcrumbs = this.storageApp.breadcrumbs;

      this.loading = false;
    },

    copyToClipboard(text: string) {
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

      this.$q.notify('Copied to clipboard');
    }
  }
})
</script>
