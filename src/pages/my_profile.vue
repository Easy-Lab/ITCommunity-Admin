<template>
  <q-page>
    <div class="row q-col-gutter-sm q-ma-xs">
      <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
        <q-card class="my-card" flat bordered>
          <q-card-section horizontal>
            <q-card-section class="q-pt-xs">
              <div class="text-overline">{{ user.city + " " + user.zipcode}}</div>
              <div class="text-h5 q-mt-sm q-mb-xs">{{user.firstname + " " + user.lastname}}</div>
              <div class="text-overline">
                <div v-if="user">
                  <label v-if="user.roles[0] === 'ROLE_USER'">Rôle : Utilisateur</label>
                  <label v-if="user.roles[0] === 'ROLE_MODERATOR'">Rôle : Moderateur</label>
                  <label v-if="user.roles[0] === 'ROLE_ADMIN'">Rôle : Administrateur</label>
                </div>
              </div>
            </q-card-section>

            <q-card-section class="col-5 flex flex-center">
              <q-img class="rounded-borders" src="https://cdn.quasar.dev/img/boy-avatar.png"/>
            </q-card-section>
          </q-card-section>

          <q-separator/>

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
        </q-card>
      </div>
      <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
        <q-card>
          <q-card-section>
            <q-form class="q-gutter-md">
              <q-input filled v-model="user.firstname" label="Prénom"/>

              <q-input filled v-model="user.lastname" label="Nom"/>

              <q-input filled v-model="user.username" label="Username"/>

              <q-input filled v-model="user.email" label="Email"/>

              <q-input filled v-model="user.phone" label="Téléphone"/>

              <q-input filled v-model="user.address" label="Adresse"/>

              <q-input filled v-model="user.address2" label="Adresse 2"/>

              <q-input filled v-model="user.zipcode" label="Code Postale"/>

              <q-input filled v-model="user.city" label="Ville"/>

              <div>
                <q-btn label="Mettre à jour" type="submit" color="primary"/>
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
    import axios from "axios";
    import UserService from "../services/user.service";

    export default {
        data() {
            return {
                user: "",
                username: "",
                reviews: ""
            };
        },
        methods: {
            getUsername() {
                this.username = JSON.parse(localStorage.getItem("username"));
                return this.username;
            },

            getUser() {
                return UserService.getUser(this.username).then(
                    response => {
                        this.user = response.data;
                        return this.user;
                    },
                    error => {
                        this.user =
                            (error.response && error.response.data) ||
                            error.message ||
                            error.toString();
                    }
                );
            },
            getReviews() {
                return UserService.getUserReviews(this.username).then(
                    response => {
                        this.reviews = response.data;
                        return this.reviews;
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
                    this.getUser;
                    this.getReviews;
                }, 60000);
            }
        },
        mounted() {
            this.fetchData();
        },
        created() {
            this.getUsername();
            this.getUser();
            this.getReviews();
        }
    };
</script>

<style scoped>
</style>
