<template>
  <q-layout view="lHh LpR lFf">
    <q-header
      reveal
      elevated
      style="background: #1E90FF;"
    >
      <q-toolbar>
        <q-toolbar-title>CRM Admin</q-toolbar-title>
        <q-btn flat round dense icon="fas fa-sign-out-alt" @click="handleLogout"/>
      </q-toolbar>
    </q-header>
    <q-drawer
      class="left-navigation text-white"
      show-if-above
      v-model="left"
      style="background-image: url(https://demos.creative-tim.com/vue-material-dashboard/img/sidebar-2.32103624.jpg) !important;"
      side="left"
      elevated
    >
      <div style="height: calc(100% - 117px);padding:10px">
        <q-toolbar>
          <q-avatar>
            <img src="https://cdn.quasar.dev/img/boy-avatar.png"/>
          </q-avatar>

          <q-toolbar-title> {{ content.firstname + " " + content.lastname }}</q-toolbar-title>
        </q-toolbar>
        <hr/>
        <q-scroll-area style="height:100%;">
          <q-list padding>
            <q-item
              active-class="tab-active"
              to="/dashboard"
              exact
              class="q-ma-sm navigation-item"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon name="dashboard"/>
              </q-item-section>

              <q-item-section>Dashboard</q-item-section>
            </q-item>

            <q-item
              active-class="tab-active"
              to="/reviews"
              class="q-ma-sm navigation-item"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon name="star"/>
              </q-item-section>

              <q-item-section>Reviews</q-item-section>
            </q-item>

            <q-item
              active-class="tab-active"
              to="/contact_form"
              class="q-ma-sm navigation-item"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon name="send"/>
              </q-item-section>

              <q-item-section>Contact Form</q-item-section>
            </q-item>

            <q-item
              active-class="tab-active"
              to="/bug_report"
              class="q-ma-sm navigation-item"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon name="assignment"/>
              </q-item-section>

              <q-item-section>Bug report</q-item-section>
            </q-item>

            <q-item
              active-class="tab-active"
              to="/users"
              class="q-ma-sm navigation-item"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon name="list"/>
              </q-item-section>

              <q-item-section>Users</q-item-section>
            </q-item>

            <q-item
              active-class="tab-active"
              to="/my_profile"
              class="q-ma-sm navigation-item"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon name="drafts"/>
              </q-item-section>

              <q-item-section>My Profile</q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>
      </div>
    </q-drawer>

    <q-page-container>
      <q-page class="row no-wrap">
        <div class="col">
          <div class="column full-height">
            <q-scroll-area class="col q-pr-sm" visible>
              <router-view/>
            </q-scroll-area>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
    import axios from "axios";
    import UserService from '../services/user.service';

    export default {
        name: 'MainLayout',
        data() {
            return {
                left: false,
                content: ''
            };
        },
        methods: {
            handleLogout() {
                this.$store.dispatch("auth/logout").then(
                    () => {
                        this.$router.push("/");
                    },
                    error => {
                        this.$q.notify("Logout trouble.");
                        this.message =
                            (error.response && error.response.data) ||
                            error.message ||
                            error.toString();
                        console.log(this.message);
                    }
                );
            },
            userRoleCheck() {
            }
        },
        mounted() {
            UserService.getUserAccount().then(
                response => {
                    localStorage.setItem('username', JSON.stringify(response.data.username));
                    if (response.data.roles.toString() !== 'ROLE_ADMIN') {
                        this.$store.dispatch("auth/logout").then(
                            () => {
                                this.$router.push("/");
                                this.$q.notify("User not allowed use this app. Use https://itcommunity.fr/");
                                console.log("User not allowed use this app. Use https://itcommunity.fr/.");
                            },
                            error => {
                                this.$q.notify("Error user role check.");
                                this.message =
                                    (error.response && error.response.data) ||
                                    error.message ||
                                    error.toString();
                                console.log(this.message);
                            }
                        );
                    }
                    this.content = response.data;
                },
                error => {
                    this.content =
                        (error.response && error.response.data) ||
                        error.message ||
                        error.toString();
                }
            );
        },
        created() {
            this.userRoleCheck();
        }
    };
</script>

<style>
  .q-drawer {
    background-image: url(../statics/images/lake.jpg) !important;
    background-size: cover !important;
  }

  .q-drawer__content {
    background-color: rgba(1, 1, 1, 0.75);
  }

  .navigation-item {
    border-radius: 5px;
  }

  .tab-active {
    background-color: #1E90FF;
  }
</style>
