<template>
  <q-page>
    <div class="row q-col-gutter-sm q-ma-xs q-mr-sm">
      <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
        <q-card>
          <q-card-section class="bg-blue-8 text-white">
            <div class="row">
              <div class="col-10">
                <div class="text-h6">Users</div>
                <div class="text-h5">{{ (nb_users)?nb_users:'Loading' }}</div>
              </div>
              <div class="col-2">
                <q-icon name="trending_up" size="62px"/>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
        <q-card>
          <q-card-section class="bg-green-8 text-white">
            <div class="row">
              <div class="col-10">
                <div class="text-h6">Review</div>
                <div class="text-h5">{{ (nb_reviews)?nb_reviews:'Loading' }}</div>
              </div>
              <div class="col-2">
                <q-icon name="far fa-dot-circle" size="62px"/>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
        <q-card>
          <q-card-section class="bg-orange-9 text-white">
            <div class="row">
              <div class="col-10">
                <div class="text-h6">News users</div>
                <div class="text-h5">
                  <q-icon name="arrow_downward"/>
                  --
                </div>
              </div>
              <div class="col-2">
                <q-icon name="compare_arrows" size="62px"/>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
    <div class="row q-col-gutter-sm q-ma-xs">
      <div class="col-12">
        <q-card bordered class="bg-white" flat>
          <q-table
            :columns="columns"
            :data="topTenUsers"
            :filter="filter"
            :grid="mode === 'grid'"
            :hide-header="mode === 'grid'"
            row-key="name"
            title="TOP 10 USERS"
          >
            <template v-slot:top-right="props">
              <q-input borderless debounce="300" dense placeholder="Search" v-model="filter">
                <template v-slot:append>
                  <q-icon name="search"/>
                </template>
              </q-input>

              <q-btn
                :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                @click="props.toggleFullscreen"
                dense
                flat
                round
                v-if="mode === 'list'"
              >
                <q-tooltip
                  :disable="$q.platform.is.mobile"
                  v-close-popup
                >{{props.inFullscreen ? 'Exit Fullscreen' : 'Toggle Fullscreen'}}
                </q-tooltip>
              </q-btn>

              <q-btn
                :icon="mode === 'grid' ? 'list' : 'grid_on'"
                @click="mode = mode === 'grid' ? 'list' : 'grid' ; separator = mode === 'grid' ? 'none' : 'horizontal'"
                dense
                flat
                round
                v-if="!props.inFullscreen"
              >
                <q-tooltip
                  :disable="$q.platform.is.mobile"
                  v-close-popup
                >{{mode==='grid' ? 'List' : 'Grid'}}
                </q-tooltip>
              </q-btn>

              <q-btn
                @click="exportTable"
                color="primary"
                icon-right="archive"
                label="Export to csv"
                no-caps
              />
            </template>
          </q-table>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
    import Vue from "vue";
    import IEcharts from "vue-echarts-v3/src/full.js";
    import {exportFile} from "quasar";
    import UserService from '../services/user.service';
    import ReviewsService from '../services/reviews.service';
    import PointService from '../services/point.service';

    Vue.component("IEcharts", IEcharts);

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
                columns: [
                    {
                        name: "username",
                        align: "left",
                        label: "Username",
                        field: "username",
                        sortable: true
                    },
                    {
                        name: "total_points",
                        align: "left",
                        label: "Total point",
                        field: "total_points",
                        sortable: true
                    },
                ],
                users: [],
                topTenUsers: [],
                reviews: [],
                nb_users: '',
                nb_reviews: '',
            };
        },
        methods: {
            exportTable() {
                // naive encoding to csv format
                const content = [this.columns.map(col => wrapCsvValue(col.label))]
                    .concat(
                        this.topTenUsers.map(row =>
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

                const status = exportFile("topTenUsers.csv", content, "text/csv");

                if (status !== true) {
                    this.$q.notify({
                        message: "Browser denied file download...",
                        color: "negative",
                        icon: "warning"
                    });
                }
            },
            handleLogout() {
                this.$store.dispatch("auth/login", this.user).then(
                    () => {
                        this.$router.push("/dashboard");
                    },
                    error => {
                        this.$q.notify("Logout trouble.");
                        this.message =
                            (error.response && error.response.data) ||
                            error.message ||
                            error.toString()
                        console.log((error.response && error.response.data) ||
                            error.message ||
                            error.toString());
                    }
                );
            },
            getUsers() {
                return UserService.getUsers().then(
                    response => {
                        this.users = response.data;
                        localStorage.setItem('nb_users', JSON.stringify(response.data.pagination.total));
                        this.nb_users = JSON.parse(localStorage.getItem('nb_users'));
                        return this.users;
                    },
                    error => {
                        this.user =
                            (error.response && error.response.data) ||
                            error.message ||
                            error.toString();
                        console.log(
                            (error.response && error.response.data) ||
                            error.message ||
                            error.toString()
                        );
                    }
                );
            },
            topTenUser() {
                return PointService.getTopTenUser().then(
                    response => {
                        this.topTenUsers = response.data;
                        return this.topTenUsers;
                    },
                    error => {
                        this.topTenUsers =
                            (error.response && error.response.data) ||
                            error.message ||
                            error.toString();
                        console.log(
                            (error.response && error.response.data) ||
                            error.message ||
                            error.toString()
                        );
                    }
                );
            },
            getReviews() {
                return ReviewsService.getReviews().then(
                    response => {
                        this.reviews = response.data;
                        localStorage.setItem('nb_reviews', JSON.stringify(response.data.pagination.total));
                        this.nb_reviews = JSON.parse(localStorage.getItem('nb_users'));
                        return this.reviews
                    },
                    error => {
                        this.user =
                            (error.response && error.response.data) ||
                            error.message ||
                            error.toString()
                        console.log(
                            (error.response && error.response.data) ||
                            error.message ||
                            error.toString()
                        );
                    }
                );
            },
            fetchData: function () {
                setInterval(() => {
                    this.topTenUser();
                    this.getUsers();
                    this.getReviews();
                }, 10000);
            }
        },
        mounted() {
            this.fetchData();
        },
        created() {
            this.topTenUser();
            this.getUsers();
            this.getReviews();
        }
    };
</script>

<style scoped>
</style>
