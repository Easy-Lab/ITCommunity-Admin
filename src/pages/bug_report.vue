<template>
  <q-page class="q-pa-sm">
    <q-table
      title="Bug reports"
      :data="bugReports.bugreports"
      :hide-header="mode === 'grid'"
      :columns="columns"
      row-key="name"
      :grid="mode=='grid'"
      :filter="filter"
      :pagination.sync="pagination"
    >
      <template v-slot:top-right="props">
        <q-input outlined dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search"/>
          </template>
        </q-input>

        <q-btn
          flat
          round
          dense
          :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
          @click="props.toggleFullscreen"
          v-if="mode === 'list'"
        >
          <q-tooltip
            :disable="$q.platform.is.mobile"
            v-close-popup
          >{{props.inFullscreen ? 'Exit Fullscreen' : 'Toggle Fullscreen'}}
          </q-tooltip>
        </q-btn>

        <q-btn
          flat
          round
          dense
          :icon="mode === 'grid' ? 'list' : 'grid_on'"
          @click="mode = mode === 'grid' ? 'list' : 'grid'; separator = mode === 'grid' ? 'none' : 'horizontal'"
          v-if="!props.inFullscreen"
        >
          <q-tooltip
            :disable="$q.platform.is.mobile"
            v-close-popup
          >{{mode==='grid' ? 'List' : 'Grid'}}
          </q-tooltip>
        </q-btn>

        <q-btn
          color="primary"
          icon-right="archive"
          label="Export to csv"
          no-caps
          @click="exportTable"
        />
      </template>
      <template v-slot:body-cell-solved="props">
        <q-td :props="props">
          <q-chip
            :color="(props.row.solved)?'green':('orange')"
            text-color="white"
            dense
            class="text-weight-bolder"
            square
            style="width: 85px"
          >{{(props.row.solved)?'Solved':('Ongoing')}}
          </q-chip>
        </q-td>
      </template>
      <template v-slot:body-cell-action="props">
        <q-td :props="props">
          <div class="q-gutter-sm">
            <q-btn dense color="primary" icon="edit"/>
            <q-btn
              @click="deleteBugReport(props.row.hash)"
              dense
              color="red"
              icon="delete"
            />
          </div>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script>
    import {exportFile} from "quasar";
    import BugReportService from "../services/bugReport.service";

    function wrapCsvValue(val, formatFn) {
        let formatted = formatFn !== void 0 ? formatFn(val) : val;

        formatted =
            formatted === void 0 || formatted === null ? "" : String(formatted);

        formatted = formatted.split('"').join('""');

        return `"${formatted}"`;
    }

    export default {
        data() {
            return {
                filter: "",
                mode: "list",
                employee_dialog: false,
                columns: [
                    {
                        name: "hash",
                        align: "left",
                        label: "Hash",
                        field: "hash",
                        sortable: true
                    },
                    {
                        name: "email",
                        align: "left",
                        label: "Email",
                        field: "email",
                        sortable: true
                    },
                    {
                        name: "firstname",
                        align: "left",
                        label: "Firstname",
                        field: "firstname",
                        sortable: true
                    },
                    {
                        name: "subject",
                        required: true,
                        label: "Subject",
                        align: "left",
                        field: "subject",
                        sortable: true
                    },
                    {
                        name: "body",
                        align: "left",
                        label: "Message",
                        field: "body",
                        sortable: true
                    },
                    {
                        name: "entry_date",
                        align: "left",
                        label: "Date",
                        field: "entry_date",
                        sortable: true
                    },
                    {
                        name: "expired_date",
                        align: "left",
                        label: "Updatet on",
                        field: "expired_date",
                        sortable: true
                    },
                    {
                        name: "solved",
                        align: "left",
                        label: "Status",
                        field: "solved",
                        sortable: true
                    },
                    {
                        name: "action",
                        align: "left",
                        label: "Action",
                        field: "action",
                        sortable: true
                    }
                ],
                bugReports: [],
                pagination: {
                    rowsPerPage: 10
                }
            };
        },
        methods: {
            exportTable() {
                // naive encoding to csv format
                const content = [this.columns.map(col => wrapCsvValue(col.label))]
                    .concat(
                        this.data.map(row =>
                            this.columns
                                .map(col =>
                                    wrapCsvValue(
                                        typeof col.field === "function"
                                            ? col.field(row)
                                            : row[col.field === void 0 ? col.name : col.field],
                                        col.format
                                    )
                                )
                                .join(",")
                        )
                    )
                    .join("\r\n");

                const status = exportFile("quotes.csv", content, "text/csv");

                if (status !== true) {
                    this.$q.notify({
                        message: "Browser denied file download...",
                        color: "negative",
                        icon: "warning"
                    });
                }
            },
            getBugReports() {
                return BugReportService.getBugReports().then(
                    response => {
                        this.bugReports = response.data;
                        return this.bugReports;
                    },
                    error => {
                        this.bugReports =
                            (error.response && error.response.data) ||
                            error.message ||
                            error.toString();
                    }
                );
            },
            deleteBugReport(hash) {
                return BugReportService.deleteBugReport(hash).then(
                    response => {
                        BugReportService.getBugReports().then(
                            response => {
                                this.bugReports = response.data;
                                this.$q.notify("Bug Report deleted.");
                                return this.bugReports
                            },
                            error => {
                                this.bugReports =
                                    (error.response && error.response.data) ||
                                    error.message ||
                                    error.toString();
                            }
                        )
                    },
                    error => {
                        this.bugReports =
                            (error.response && error.response.data) ||
                            error.message ||
                            error.toString();
                    }
                );
            },
            fetchData: function () {
                setInterval(() => {
                    this.getBugReports();
                }, 60000);
            }
        },
        mounted() {
            this.fetchData();
        },
        created() {
            this.getBugReports();
        }
    };
</script>
<style>
  .q-chip__content {
    display: block;
    text-align: center;
  }
</style>
