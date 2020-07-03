<template>
  <q-page class="q-pa-sm">
    <q-table
      title="Reviews"
      :data="reviews.reviews"
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
      <template v-slot:body-cell-detail="props">
        <q-td :props="props">
          <q-btn
            @click="showUser(props.row.username,props.row.firstname,props.row.lastname,props.row.city,props.row.zipcode)"
            dense
            round
            color="secondary"
            icon="pageview"
          />
        </q-td>
      </template>
      <template v-slot:body-cell-action="props">
        <q-td :props="props">
          <div class="q-gutter-sm">
            <q-btn dense color="primary" icon="edit"/>
            <q-btn
              @click="deleteReviews(props.row.hash)"
              dense
              color="red"
              icon="delete"
            />
          </div>
        </q-td>
      </template>
    </q-table>
    <q-dialog v-model="user_dialog">
      <q-card class="my-card" flat bordered>
        <q-card-section>
          <div class="text-h6">
            Détail d'utilisateur : {{ username }}
            <q-btn round flat dense icon="close" class="float-right" color="grey-8" v-close-popup></q-btn>
          </div>
        </q-card-section>
        <q-card-section horizontal>
          <q-card-section class="q-pt-xs">
            <div class="text-overline">{{ city }} {{ zipcode }}</div>
            <div class="text-h5 q-mt-sm q-mb-xs">{{ firstname }} {{ lastname }}</div>
            <div class="text-caption">
              <q-input :disable="true" filled v-model="firstname" label="Prénom"/>
            </div>
          </q-card-section>

          <q-card-section class="col-5 flex flex-center">
            <q-img class="rounded-borders" src="https://cdn.quasar.dev/img/boy-avatar.png"/>
          </q-card-section>
        </q-card-section>

        <q-separator/>

        <q-card-section>Assessing clients needs and present suitable promoted products. Liaising with and persuading
          targeted doctors to prescribe our products utilizing effective sales skills.
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
    import {exportFile} from "quasar";
    import ReviewsService from "../services/reviews.service";

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
                username: "",
                firstname: "",
                lastname: "",
                email: "",
                phone: "",
                adress: "",
                adress2: "",
                city: "",
                zipcode: "",
                filter: "",
                mode: "list",
                user_dialog: false,
                columns: [
                    {
                        name: "hash",
                        align: "left",
                        label: "Hash",
                        field: "hash",
                        sortable: true
                    },
                    {
                        name: "companyComponent",
                        required: true,
                        label: "Company",
                        align: "left",
                        field: "companyComponent",
                        sortable: true
                    },
                    {
                        name: "nameComponent",
                        align: "left",
                        label: "Name Component",
                        field: "nameComponent",
                        sortable: true
                    },
                    {
                        name: "otherInformationComponent",
                        align: "left",
                        label: "Other Information",
                        field: "otherInformationComponent",
                        sortable: true
                    },
                    {
                        name: "rating",
                        align: "left",
                        label: "Rating",
                        field: "rating",
                        sortable: true
                    },
                    {
                        name: "type",
                        align: "left",
                        label: "Type",
                        field: "type",
                        sortable: true
                    },
                    {
                        name: "created",
                        align: "left",
                        label: "Created",
                        field: "created",
                        sortable: true
                    },
                    {
                        name: "updated",
                        align: "left",
                        label: "Updated",
                        field: "updated",
                        sortable: true
                    },
                    {
                        name: "detail",
                        align: "left",
                        label: "Details",
                        field: "detail",
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
                reviews: [],
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
                        this.reviews.map(row =>
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

                const status = exportFile("reviews.csv", content, "text/csv");

                if (status !== true) {
                    this.$q.notify({
                        message: "Browser denied file download...",
                        color: "negative",
                        icon: "warning"
                    });
                }
            },
            showUser(username, firstname, lastname, city, zipcode) {
                this.user_dialog = true;
                this.username = username;
                this.firstname = firstname;
                this.lastname = lastname;
                this.city = city;
                this.zipcode = zipcode
            },
            getReviews() {
                return ReviewsService.getReviewsUsers().then(
                    response => {
                        this.reviews = response.data;
                        return this.reviews
                    },
                    error => {
                        this.reviews =
                            (error.response && error.response.data) ||
                            error.message ||
                            error.toString();
                    }
                );
            },
            deleteReviews(hash) {
                return ReviewsService.deleteReviews(hash).then(
                    response => {
                        ReviewsService.getReviews().then(
                            response => {
                                this.reviews = response.data;
                                this.$q.notify("Reviews deleted.");
                                return this.reviews
                            },
                            error => {
                                this.reviews =
                                    (error.response && error.response.data) ||
                                    error.message ||
                                    error.toString();
                            }
                        )
                    },
                    error => {
                        this.reviews =
                            (error.response && error.response.data) ||
                            error.message ||
                            error.toString();
                    }
                );
            },
            fetchData: function () {
                setInterval(() => {
                    this.getReviews();
                }, 60000);
            }
        },
        mounted() {
            this.fetchData();
        },
        created() {
            this.getReviews();
        }
    };
</script>
<style>
  .q-chip__content {
    display: block;
    text-align: center;
  }
</style>
