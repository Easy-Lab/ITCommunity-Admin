<template>
  <q-page class="q-pa-sm">
    <q-table
      title="Utilisateurs"
      :data="users.users"
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
            @click="showUser(props.row.username,props.row.firstname,props.row.lastname,props.row.city,props.row.zipcode, props.row.reviews, props.row.hash)"
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
            <q-btn
              @click=""
              dense color="primary"
              icon="edit"
            />
            <q-btn
              @click="deleteUser(props.row.hash)"
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
              <q-input :disable="true" filled v-model="firstname" label="First name"/>
              <q-input :disable="true" filled v-model="hash" label="Hash"/>
            </div>
          </q-card-section>

          <q-card-section class="col-5 flex flex-center">
            <q-img class="rounded-borders" src="https://cdn.quasar.dev/img/boy-avatar.png"/>
          </q-card-section>
        </q-card-section>

        <q-separator/>

        <q-card-section>
          <div v-if="reviews">
            <q-card inline v-for="review in reviews" :key="review.hash">
              <q-card-media>
                <img src/>
              </q-card-media>
              <q-card-title>
                {{ review.nameComponent }}
                {{ review.companyComponent }}
                <q-rating slot="subtitle" v-model="review.rating" :max="5"/>
                <div slot="right" class="row items-center">
                  <p>{{ review.type }}</p>
                  <p>{{ review.otherInformationComponent }}</p>
                </div>
              </q-card-title>
              <q-card-main>
                <p class="text-faded">{{ body }}</p>
              </q-card-main>
              <q-card-actions>
                <q-btn label="Modifier" type="submit" color="primary"/>
              </q-card-actions>
            </q-card>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
    import {exportFile} from "quasar";
    import axios from "axios";
    import UserService from "../services/user.service";

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
                hash: "",
                mode: "list",
                user_dialog: false,
                columns: [
                    {
                        name: "username",
                        align: "left",
                        label: "Username",
                        field: "username",
                        sortable: true
                    },
                    {
                        name: "firstname",
                        required: true,
                        label: "Prénom",
                        align: "left",
                        field: "firstname",
                        sortable: true
                    },
                    {
                        name: "lastname",
                        align: "left",
                        label: "Nom",
                        field: "lastname",
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
                        name: "phone",
                        align: "left",
                        label: "Phone",
                        field: "phone",
                        sortable: true
                    },
                    {
                        name: "city",
                        align: "left",
                        label: "Ville",
                        field: "city",
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
                users: [],
                reviews: [],
                pagination: {
                    rowsPerPage: 10
                }
            };
        },
        methods: {
            showUser(username, firstname, lastname, city, zipcode, reviews, hash) {
                this.user_dialog = true;
                this.username = username;
                this.firstname = firstname;
                this.lastname = lastname;
                this.city = city;
                this.zipcode = zipcode;
                this.reviews = reviews;
                this.hash = hash;
            },
            deleteUser(hash) {
                return UserService.deleteUser(hash).then(
                    response => {
                        UserService.getUsersReviews().then(
                            response => {
                                this.users = response.data
                                return this.users
                            },
                            error => {
                                this.user =
                                    (error.response && error.response.data) ||
                                    error.message ||
                                    error.toString();
                            }
                        )
                    },
                    error => {
                        this.user =
                            (error.response && error.response.data) ||
                            error.message ||
                            error.toString();
                    }
                );
            },
            exportTable() {
                // naive encoding to csv format
                const content = [this.columns.map(col => wrapCsvValue(col.label))]
                    .concat(
                        this.users.map(row =>
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

                const status = exportFile(
                    "users_list.csv",
                    content,
                    "text/csv"
                );

                if (status !== true) {
                    this.$q.notify({
                        message: "Browser denied file download...",
                        color: "negative",
                        icon: "warning"
                    });
                }
            },
            getUsers() {
                return UserService.getUsersReviews().then(
                    response => {
                        this.users = response.data
                        return this.users
                    },
                    error => {
                        this.user =
                            (error.response && error.response.data) ||
                            error.message ||
                            error.toString();
                    }
                );
            },
            getUsername() {
                this.username = JSON.parse(localStorage.getItem("username"));
                return this.username;
            },
            fetchData: function () {
                setInterval(() => {
                    this.getUsers();
                }, 60000);
            }
        },
        mounted() {
            this.fetchData();
        },
        created() {
            this.getUsername();
            this.getUsers();
        }
    };
</script>
<style>
  .q-chip__content {
    display: block;
    text-align: center;
  }
</style>
