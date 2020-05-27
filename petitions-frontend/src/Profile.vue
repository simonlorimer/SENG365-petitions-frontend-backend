<template>
  <v-app>
    <br/><br/><br/>
    <div v-if="this.loggedIn">
      <h1>My Profile</h1><br>
      <div align="center" justify="center">
        <v-img
          :src="'http://localhost:4941/api/v1/users/' + this.userId + '/photo'"
          lazy-src="src/assets/user-default.jpg"
          max-width="150"
          max-height="150"
        /><br>
        <v-btn @click="deleteUserPhoto()" small color="error"><v-icon left>delete</v-icon>Delete Photo</v-btn>
      </div>
      <br>


      <strong>Name: </strong>{{user.name}}<br/>
      <strong>Email: </strong>{{user.email}}<br/>
      <strong>City: </strong>{{user.city}}<br/>
      <strong>Country: </strong>{{user.country}}<br/>

      <br/>

      <v-btn color="warning" type="button" class="btn btn-primary" data-toggle="modal"
                   data-target="#editUserModal"><v-icon left>edit</v-icon>Edit User/Photo</v-btn>

      <div class="modal fade" id="editUserModal" tabindex="-1" role="dialog"
           aria-labelledby="editUserModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="editUserModalLabel">Edit User</h5>
            </div>

            <v-form v-on:submit.prevent="editUser()"
                    ref="form"
                    v-model="valid"
                    lazy-validation
            >
              <div class="modal-body">
                User Details:
                <v-text-field
                  v-model="newName"
                  label="Full Name"
                  :rules="nameRules"
                  required
                />
                <v-text-field
                  v-model="newEmail"
                  label="E-mail"
                  :rules="emailRules"
                  required
                />

                <v-text-field
                  v-model="newCity"
                  label="City"
                />
                <v-text-field
                  v-model="newCountry"
                  label="Country"
                />

                Change Password:
                <v-text-field
                  v-model="currentPassword"
                  name="password"
                  label="Current Password"
                  type="password"
                  required
                />
                <v-text-field
                  v-model="newPassword"
                  name="New Password"
                  label="New Password"
                  type="password"
                  required
                />

                <v-text-field
                  v-model="confirmNewPassword"
                  name="New Password"
                  label="Confirm New Password"
                  type="password"
                  required
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
                  color="warning"
                  type="submit"
                >Submit Changes
                </v-btn>
                <v-btn type="button" class="btn btn-secondary" data-dismiss="modal">
                  Close
                </v-btn>
              </div>
            </v-form>

          </div>
        </div>
      </div>

    </div>
  </v-app>

</template>

<script>
  export default {
    name: 'app',
    data () {
      return {
        error: "",
        errorFlag: false,
        loggedIn: false,
        valid: true,
        user: [],
        userId: "",
        newName: "",
        newEmail: "",
        newCity: null,
        newCountry: null,
        userPhoto: null,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",

        nameRules: [
          v => (v && v.length <= 64) || 'Name must be valid!'
        ],
        emailRules: [
          v => /.+@.+/.test(v) || 'E-mail must be valid!'
        ]
      }
    },
    mounted: function () {
      this.getUserDetails();
      if (localStorage.getItem('reloaded')) {
        // The page was just reloaded. Clear the value from local storage
        // so that it will reload the next time this page is visited.
        localStorage.removeItem('reloaded');
      } else {
        // Set a flag so that we know not to reload the page twice.
        localStorage.setItem('reloaded', '1');
        location.reload();
      }
    },
    methods: {
      getUserDetails: function () {
        this.$http.get('http://localhost:4941/api/v1/users/' + localStorage.getItem("authId"), {
          headers: {
            'X-Authorization': localStorage.getItem("authToken")
          }
        })
          .then((response) => {
            this.user = response.data;
            this.newName = response.data.name;
            this.newEmail = response.data.email;
            this.newCity = response.data.city;
            this.newCountry = response.data.country;
            this.userId = localStorage.getItem("authId");
            this.loggedIn = true;
          }).catch ((error) => {
          this.error = error;
          this.errorFlag = true;
          this.$router.push({path: "/"});
        });
      },
      editUser: function () {
        var jsonObject = {};
        if (this.newName !== this.user.name) {
          jsonObject['name'] = this.newName;
        }
        if (this.newName == "") {
          alert("Name cannot be empty.")
          return;
        }
        if (this.newEmail !== this.user.email) {
          jsonObject['email'] = this.newEmail;
        }
        if (this.newEmail == "") {
          alert("Email cannot be empty.")
          return;
        }
        if (this.newCity !== this.user.city) {
          jsonObject['city'] = this.newCity;
        }
        if (this.newCountry !== this.user.country) {
            jsonObject['country'] = this.newCountry;
        }

        if (this.currentPassword !== "") {
          if (this.newPassword !== this.confirmNewPassword) {
            alert("Passwords do not match. Please try again.")
            return;
          }
          jsonObject['currentPassword'] = this.currentPassword;
          jsonObject['password'] = this.newPassword;
        } else if (this.newPassword !== "" || this.confirmNewPassword) {
          alert("Please confirm the current password to change passwords");
          return;
        }

        if (jsonObject === {}) {
          this.uploadUserPhoto()
          $('#editUserModal').modal('hide');
          location.reload();
          return;
        } else {
          this.uploadUserPhoto();
          $('#editUserModal').modal('hide');
          location.reload();
        }
        this.$http.patch('http://localhost:4941/api/v1/users/' + this.userId, jsonObject,
          { headers: {
              'Content-Type': 'application/json',
              'X-Authorization': localStorage.getItem("authToken")
            }})
          .then((response) => {
            $('#editUserModal').modal('hide');
            location.reload();
          })
          .catch((error) => {
            this.error = error;
            this.errorFlag = true;
          });

      },
      photoProcessing: function(event) {
        this.userPhoto = event.target.files[0];
      },
      uploadUserPhoto: function () {
          if (this.userPhoto == null) {
            return;
          }
          this.$http.put('http://localhost:4941/api/v1/users/' + this.userId + '/photo', this.userPhoto,{
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
      },
      deleteUserPhoto: function () {
        this.$http.delete('http://localhost:4941/api/v1/users/' + this.userId + '/photo', {
          headers: {
            'X-Authorization': localStorage.getItem("authToken")
          }
        })
          .then((response) => {
            location.reload();
          }).catch ((error) => {
            alert("You do not have a photo to delete.");
        });
      }
    }
  }
</script>

<style scoped>

</style>
