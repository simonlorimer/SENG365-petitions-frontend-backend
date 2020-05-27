<template>
  <div id="app">
    <v-app>
      <header>
        <v-app-bar fixed dense flat class="grey lighten-4">
          <v-toolbar-title class="text-uppercase ">
            <span class="font-weight-light grey--text">Make</span><span class="font-weight-medium">Petitions</span>
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <router-link><v-btn>View Petitions</v-btn></router-link>
          <v-btn large depressed @click="goHome()"><v-icon left>home</v-icon>Home</v-btn>
          <v-btn large depressed @click="goPetitions()"><v-icon left>assignment</v-icon>Petitions</v-btn>
          <v-spacer/><v-spacer/><v-spacer/><v-spacer/><v-spacer/><v-spacer/><v-spacer/><v-spacer/><v-spacer/><v-spacer/>
          <v-spacer/><v-spacer/><v-spacer/><v-spacer/><v-spacer/><v-spacer/><v-spacer/><v-spacer/><v-spacer/><v-spacer/>

          <div v-if="this.loggedIn">
            <v-btn color="warning" @click="myProfile()"><v-icon left>account_circle</v-icon>My Profile</v-btn>
            <v-btn color="error" @click="logoutUser()"><v-icon left>input</v-icon>Logout</v-btn>
          </div>
          <div v-else>
            <v-btn color="success" type="button" class="btn btn-primary" data-toggle="modal"
                   data-target="#registerUserModal"><v-icon left>add_circle</v-icon>
              Register
            </v-btn>

            <v-btn dark color="blue" type="button" class="btn btn-primary" data-toggle="modal"
                   data-target="#LoginUserModal"><v-icon left>account_circle</v-icon>
              Login
            </v-btn>
          </div>
        </v-app-bar>
      </header>
      <body>
      <router-view/>
      </body>

      <div>
        <div>
          <div id="Login">
            <div class="modal fade" id="LoginUserModal" tabindex="-1" role="dialog"
                 aria-labelledby="loginUserModalLabel" aria-hidden="true">
              <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <h4 class="modal-title" id="loginUserModalLabel">Login</h4>
                  </div>
                  <v-form v-on:submit.prevent="loginUser()"
                          ref="form"
                          v-model="valid"
                          lazy-validation
                  >
                    <div class="modal-body">
                      <v-text-field
                        v-model="email"
                        label="E-mail"
                        :rules="emailRules"
                        required
                      />
                      <v-text-field
                        v-model="password"
                        name="password"
                        label="Password"
                        type="password"
                        required
                      />
                    </div>
                    <div class="modal-footer">
                      <v-alert v-if="errorFlag" color="error" icon="Error">
                        {{ error }}
                      </v-alert>
                      <v-btn dark
                        color="blue"
                        type="submit"
                      ><v-icon left>account_circle</v-icon>Login
                      </v-btn>
                      <v-btn @click="resetFormData()" type="button" class="btn btn-secondary" data-dismiss="modal">
                        <v-icon left>close</v-icon>Close
                      </v-btn>
                    </div>
                  </v-form>
                </div>
              </div>
            </div>
          </div>

          <div id="Register">
            <div class="modal fade" id="registerUserModal" tabindex="-1" role="dialog"
                 aria-labelledby="registerUserModalLabel" aria-hidden="true">
              <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <h4 class="modal-title" id="registerUserModalLabel">Create Account</h4>
                  </div>
                  <v-form v-on:submit.prevent="registerUser()"
                          ref="form"
                          v-model="valid"
                          lazy-validation
                  >
                    <div class="modal-body">
                      <v-text-field
                        v-model="name"
                        label="Full Name"
                        :rules="nameRules"
                        required
                      />
                      <v-text-field
                        v-model="email"
                        label="E-mail"
                        :rules="emailRules"
                        required
                      />
                      <v-text-field
                        v-model="password"
                        name="password"
                        label="Password"
                        type="password"
                        required
                      />
                      <v-text-field
                        v-model="rePassword"
                        name="Re-type password"
                        label="Confirm Password"
                        type="password"
                        :rules="[checkPasswords]"
                        required
                      />
                      <v-text-field
                        v-model="city"
                        label="City"
                      />
                      <v-text-field
                        v-model="country"
                        label="Country"
                      />

                      <input type="file"
                             @change="photoProcessing($event)"
                             id="myFile"
                             accept="image/png, image/jpeg, image/jpg, image/gif">

                    </div>
                    <div class="modal-footer">
                      <v-alert v-if="errorFlag" color="error" icon="Error">
                        {{ error }}
                      </v-alert>
                      <v-btn
                        color="success"
                        type="submit"
                      ><v-icon left>add_circle</v-icon>Register
                      </v-btn>
                      <v-btn @click="resetFormData()" type="button" class="btn btn-secondary" data-dismiss="modal">
                        <v-icon left>close</v-icon>Close
                      </v-btn>
                    </div>
                  </v-form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </v-app>
  </div>
</template>

<script>
  export default {
    name: 'app',
    data () {
      return {
        error: "",
        errorFlag: false,
        loggedIn: false,
        name: "",
        email: "",
        password: "",
        rePassword: "",
        city: "",
        country: "",
        userPhoto: null,
        valid: true,
        nameRules: [
          v => (v && v.length <= 64) || 'Name must be valid!'
        ],
        emailRules: [
          v => /.+@.+/.test(v) || 'E-mail must be valid!'
        ]
      }
    },
    mounted: function () {
      this.checkLogin();
    },
    methods: {
      checkPasswords: function () {
        return this.password !== this.rePassword ? "Passwords do not match" : true;
      },
      registerUser: function () {
        if (this.name === "") {
          alert("Please enter a valid name!")
        } else if (this.email === "") {
          alert("Please enter a valid email address!")
        } else if (this.password === "") {
          alert("Please enter a valid password")
        } else if (this.password !== this.rePassword) {
          alert("Passwords do not match!")
        } else {
          var jsonObject = {};
          jsonObject["name"] = this.name;
          jsonObject["email"] = this.email;
          jsonObject["password"] = this.password;

          if (this.city != "") {
            jsonObject["city"] = this.city;
          }
          if (this.country != "") {
            jsonObject["country"] = this.country;
          }
          this.$http.post('http://localhost:4941/api/v1/users/register', jsonObject,
            { headers: {
                'Content-Type': 'application/json'
              }})
            .then (async (response) => {
              await this.loginUser();
              this.uploadUserPhoto(response.data.userId);
              $('#registerUserModal').modal('hide');
            })
            .catch((error) => {
              this.error = error;
              this.errorFlag = true;
            });
        }
      },
      loginUser: async function () {
        if (this.email === "") {
          alert("Email cannot be empty!")
          return;
        }
        if (this.password === "") {
          alert("Password cannot be empty!")
          return;
        }
        await this.$http.post('http://localhost:4941/api/v1/users/login', JSON.stringify({
          "email": this.email,
          "password": this.password
        }),{
          headers: {
            'Content-Type': 'application/json'
          }})
          .then((response) => {
            localStorage.setItem("authId", response.data.userId);
            localStorage.setItem("authToken", response.data.token);
            location.reload();
          })
          .catch((error) => {
            this.error = error;
            this.errorFlag = true;
          });
      },
      logoutUser: function () {
        this.$http.post('http://localhost:4941/api/v1/users/logout', {}, {
          headers: {
            'X-Authorization': localStorage.getItem("authToken")
          }
        })
          .then((response) => {
            localStorage.clear();
            location.reload();
          }).catch ((error) => {
          this.error = error;
          this.errorFlag = true;
        });

      },
      resetFormData: function () {
        this.name = "";
        this.email = "";
        this.password = "";
        this.rePassword = "";
        this.city = null;
        this.country = null;
        this.error = '';
        this.errorFlag = false;
        this.userPhoto = null;
      },
      checkLogin: function () {
        this.$http.get('http://localhost:4941/api/v1/users/' + localStorage.getItem("authId"), {
          headers: {
            'X-Authorization': localStorage.getItem("authToken")
          }
        })
          .then((response) => {
            this.loggedIn = true;
            localStorage.setItem("name", response.data.name);
            localStorage.setItem("email", response.data.email);
            localStorage.setItem("city", response.data.city);
            localStorage.setItem("country", response.data.country);
          }).catch ((error) => {
          this.loggedIn = false;
        });
      },
      goHome: function () {
        this.$router.push({path: "/"});

      },
      goPetitions: function () {
        this.$router.push({path: "/petitions"});
      },
      myProfile: function () {
        this.$router.push({path: "/profile"});
      },
      photoProcessing: function(event) {
        this.userPhoto = event.target.files[0];
      },
      uploadUserPhoto: function (id) {
        if (this.userPhoto == null) {
          return;
        }
        this.$http.put('http://localhost:4941/api/v1/users/' + id + '/photo', this.userPhoto,{
          headers: {
            'X-Authorization': localStorage.getItem("authToken"),
            'Content-Type': this.userPhoto.type
          }
        })
          .then((response) => {
          }).catch ((error) => {
          this.error = error;
          this.errorFlag = true;
        });
      }
    }
  }
</script>

<style>
  #app {
    background-color: white;
    text-align: center;
  }


</style>
