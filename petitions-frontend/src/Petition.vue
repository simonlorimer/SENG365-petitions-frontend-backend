<template>
  <v-app>
    <div>
      <br/><br/><br/>
      <router-link :to="{ name: 'petitions'}"><v-btn color="error"><v-icon left>arrow_back</v-icon>Back to petitions</v-btn></router-link>

      <h3><v-icon left>share</v-icon>Share Petition:</h3>

      <ShareNetwork
        network="facebook"
        :url="'http://canterbury.ac.nz/petitions/' + this.petition.petitionId.toString()"
        :title="'' + this.petition.title"
        :description="'' + this.petition.description"
        :quote="'' + this.petition.title"
        hashtags="petition"
      >
        Share on Facebook
      </ShareNetwork><br>

      <ShareNetwork
        network="reddit"
        :url="'http://canterbury.ac.nz/petitions/' + this.petition.petitionId.toString()"
        :title="'' + this.petition.title"
      >
        Share on Reddit
      </ShareNetwork><br>

      <ShareNetwork
        network="twitter"
        :url="'http://canterbury.ac.nz/petitions/' + this.petition.petitionId.toString()"
        :title="'' + this.petition.title"
        hashtags="petition"
      >
        Share on Twitter
      </ShareNetwork><br>

      <div>

        <div v-if="$route.params.petitionId">
          <div id="petition">
            <v-simple-table>
              <table>
                <tr><td><h1>{{ this.petition.title }}</h1></td></tr><br/>

                <div align="center" justify="center">
                  <v-img
                    :src="'http://localhost:4941/api/v1/petitions/' + this.petition.petitionId + '/photo'"
                    lazy-src="src/assets/petition-default.jpg"
                    max-width="300"
                    max-height="300"
                  />
                </div>

                <tr><td><strong>Petition ID: </strong>{{ this.petition.petitionId }}</td></tr>

                <tr><td><strong>Description: </strong>{{ this.petition.description }}</td></tr><br/>

                <tr>
                  <div align="center" justify="center"><v-img
                    :src="'http://localhost:4941/api/v1/users/' + this.petition.authorId + '/photo'"
                    lazy-src="https://i.imgur.com/jyFO5Sw.jpg"
                    max-width="150"
                    max-height="150"
                  /></div>
                </tr>
                <tr><td><strong>Author Name: </strong>{{ this.petition.authorName }}</td></tr>
                <tr><td><strong>Author City: </strong>
                  <template v-if this.petition.authorCity != null>{{ this.petition.authorCity }}</template>
                </td></tr>
                <tr><td><strong>Author Country: </strong>
                  <template v-if this.petition.authorCountry != null>{{ this.petition.authorCountry }}</template>
                </td></tr>
                <tr><td><strong>Signature Count: </strong>{{ this.petition.signatureCount }}</td></tr>
                <tr><td><strong>Category: </strong>{{ this.petition.category }}</td></tr>
                <tr><td><strong>Created: </strong> {{ this.petition.createdDate}}</td></tr>
                <tr><td><strong>Closing Date: </strong>{{ this.petition.closingDate}}</td></tr>
              </table>
            </v-simple-table>

            <br/>

            <div v-if="errorFlag" style="color: red">
              {{ error }}
            </div>

            <div v-if="this.loggedIn">

              <div v-if="petitionOwner != true">
                <v-btn v-if="alreadySigned == false" dark color="success" type="button" class="btn btn-primary" data-toggle="modal"
                       data-target="#signPetitionModal"><v-icon left>edit</v-icon>Sign Petition</v-btn>
                <v-btn v-if="(alreadySigned == true)" dark color="error" type="button" class="btn btn-primary" data-toggle="modal"
                       data-target="#deleteSignatureModal"><v-icon left>delete</v-icon>Remove Signature</v-btn>
              </div>


              <div v-if="petitionOwner"><v-btn dark color="warning" type="button" class="btn btn-primary" data-toggle="modal"
                                               data-target="#editPetitionModal"><v-icon left>edit</v-icon>Edit Petition</v-btn>
                <v-btn color="error" type="button" class="btn btn-primary" data-toggle="modal"
                       data-target="#deletePetitionModal"><v-icon left>delete</v-icon>Delete Petition</v-btn></div></div>

            <div class="modal fade" id="editPetitionModal" tabindex="-1" role="dialog"
                 aria-labelledby="editPetitionModalLabel" aria-hidden="true">
              <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="editPetitionModalLabel">Edit Petition</h5>
                  </div>
                  <v-form
                    v-on:submit.prevent="editPetition($route.params.petitionId)"
                    ref="form"
                    v-model="valid"
                    lazy-validation
                  >
                    <div class="modal-body">

                      <v-text-field
                        v-model="newTitle"
                        label="Title"
                      />

                      <v-text-field
                        v-model="newDescription"
                        label="Description"
                      />

                      <v-select
                        v-model="categorySelect"
                        :items="categoryNames"
                        label="Select a Category"
                      />

                      <h3>Closing Date (optional):</h3><br>
                      <v-date-picker v-model="date"
                                     width="290"
                                     class="mt-4"/>

                    </div>

                    <h3>Photo (optional):</h3>
                    <input type="file"
                           @change="photoProcessing($event)"
                           id="myFile"
                           accept="image/png, image/jpeg, image/jpg, image/gif">

                    <div class="modal-footer">
                      <v-btn
                        color="warning"
                        type="submit"
                      ><v-icon left>edit</v-icon>Edit Petition
                      </v-btn>
                      <v-btn data-dismiss="modal"><v-icon left>close</v-icon>Close</v-btn>

                    </div>
                  </v-form>
                </div>
              </div>
            </div>

            <div class="modal fade" id="deletePetitionModal" tabindex="-1" role="dialog"
                 aria-labelledby="deletePetitionModalLabel" aria-hidden="true">
              <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="deletePetitionModalLabel">Delete Petition</h5>
                  </div>
                  <div class="modal-body">
                    Are you sure that you want to delete this petition?
                  </div>
                  <div class="modal-footer">
                    <v-btn color="error" type="button" class="btn btn-primary" data-dismiss="modal"
                            v-on:click="deletePetition($route.params.petitionId)">
                      <v-icon left>delete</v-icon>Delete Petition
                    </v-btn>
                    <v-btn type="button" class="btn btn-secondary" data-dismiss="modal">
                      <v-icon left>close</v-icon>Close
                    </v-btn>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal fade" id="signPetitionModal" tabindex="-1" role="dialog"
                 aria-labelledby="signPetitionModalLabel" aria-hidden="true">
              <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="signPetitionModalLabel">Sign Petition</h5>
                  </div>
                  <div class="modal-body">
                    Are you sure that you want to sign this petition?
                  </div>
                  <div class="modal-footer">
                    <v-btn color="success" type="button" class="btn btn-primary" data-dismiss="modal"
                            v-on:click="signPetition($route.params.petitionId)">
                      <v-icon left>edit</v-icon>Sign Petition
                    </v-btn>
                    <v-btn type="button" class="btn btn-secondary" data-dismiss="modal">
                      <v-icon left>close</v-icon>Close
                    </v-btn>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal fade" id="deleteSignatureModal" tabindex="-1" role="dialog"
                 aria-labelledby="deleteSignatureModalLabel" aria-hidden="true">
              <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="deleteSignatureModalLabel">Remove Signature</h5>
                  </div>
                  <div class="modal-body">
                    Are you sure that you want to remove your signature?
                  </div>
                  <div class="modal-footer">
                    <v-btn color="error" type="button" class="btn btn-primary" data-dismiss="modal"
                            v-on:click="deleteSignature($route.params.petitionId)">
                      <v-icon left>delete</v-icon>Remove Signature
                    </v-btn>
                    <v-btn type="button" class="btn btn-secondary" data-dismiss="modal">
                      <v-icon left>close</v-icon>Close
                    </v-btn>
                  </div>
                </div>
              </div>
            </div><br>

            


            <v-simple-table>
              <h1>Signature List:</h1>
              <table>
                <tr>
                  <td></td>
                  <td></td>
                  <td><strong>Name</strong></td>
                  <td><strong>City</strong></td>
                  <td><strong>Country</strong></td>
                </tr>

                <template v-for="user in petitionSignatures">
                  <tr>
                    <td></td>
                    <td><v-img
                      :src="'http://localhost:4941/api/v1/users/' + user.signatoryId + '/photo'"
                      lazy-src="https://i.imgur.com/jyFO5Sw.jpg"
                      max-width="75"
                      max-height="75"
                    /></td>
                    <td>{{user.name}}</td>
                    <td><template v-if user.city != null>{{ user.city }}</template></td>
                    <td><template v-if user.country != null>{{ user.country }}</template></td>
                  </tr>
                </template>
              </table>
            </v-simple-table>

          </div>
        </div>
      </div>
    </div>
  </v-app>

</template>

<script>
  export default {
    data () {
      return {
        error: "",
        errorFlag: false,
        petition: null,
        petitionPhoto: null,
        valid: true,
        loggedIn: false,
        petitionSignatures: [],
        alreadySigned: false,
        petitionOwner: false,
        categoryIds: [],
        categoryNames: [],
        categorySelect: null,
        search: "",
        newTitle: "",
        newDescription: "",
        date: null
      }
    },
    mounted: function() {
      this.getSinglePetition(this.$route.params.petitionId);
      this.getPetitionSignatures(this.$route.params.petitionId);
      this.getCategories();
      this.checkLogin();
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
      checkLogin: function () {
        this.$http.get('http://localhost:4941/api/v1/users/' + localStorage.getItem("authId"), {
          headers: {
            'X-Authorization': localStorage.getItem("authToken")
          }
        })
          .then((response) => {
            localStorage.setItem("name", response.data.name);
            localStorage.setItem("email", response.data.email);
            localStorage.setItem("city", response.data.city);
            localStorage.setItem("country", response.data.country);
            this.loggedIn = true;
          }).catch ((error) => {
          this.loggedIn = false;
          localStorage.clear();
        });

      },
      getSinglePetition: function(id) {
        this.$http.get('http://localhost:4941/api/v1/petitions/' + id)
          .then((response) => {
            this.petition = response.data;
            if (response.data.authorName == localStorage.getItem("name")) {
              this.petitionOwner = true;
              this.newTitle = response.data.title;
              this.newDescription = response.data.description;
              this.categorySelect = response.data.category;
              if (response.data.closingDate != null) {
                this.date = (response.data.closingDate).substring(0, 10);
              }
            }
          })
          .catch((error) => {
            this.error = error;
            this.errorFlag = true;
          });
      },
      getPetitionSignatures: function(id) {
        this.$http.get('http://localhost:4941/api/v1/petitions/' + id + '/signatures')
          .then((response) => {
            this.petitionSignatures = response.data;
            for (var i = 0; i < response.data.length; i++) {
              if (response.data[i].name == localStorage.getItem("name")) {
                this.alreadySigned = true;
              }
            }
          })
          .catch((error) => {
            this.error = error;
            this.errorFlag = true;
          });
      },
      deletePetition: function(id) {
        this.$http.delete('http://localhost:4941/api/v1/petitions/' + id, {headers: {
          'X-Authorization': localStorage.getItem("authToken")
          }})
          .then((response) => {
            this.$router.push({path: "/petitions"});
          })
          .catch((error) => {
            this.error = error;
            this.errorFlag = true;
            alert("You do not have authorization to delete this Petition.")
          });
      },
      signPetition: function(id) {
        this.$http.post('http://localhost:4941/api/v1/petitions/' + id + '/signatures', {}, {
          headers: {
            'X-Authorization': localStorage.getItem("authToken")
          }
        })
          .then((response) => {
            location.reload();
          })
          .catch((error) => {
            this.error = error;
            this.errorFlag = true;
            alert("Sorry, but the Petition has already closed.")
          });
      },
      deleteSignature: function(id) {
        this.$http.delete('http://localhost:4941/api/v1/petitions/' + id + '/signatures', {
          headers: {
            'X-Authorization': localStorage.getItem("authToken")
          }
        })
          .then((response) => {
            location.reload();
          })
          .catch((error) => {
            this.error = error;
            this.errorFlag = true;
            if (this.petitionOwner) {
              alert("You cannot remove a signature from your own petition.")
            } else {
              alert("Sorry, but the Petition has already closed.")
            }
          });
      },
      getCategories: function () {
        this.$http.get('http://localhost:4941/api/v1/petitions/categories')
          .then((response) => {
            this.categories = response.data;
            var i;
            for (i = 0; i < response.data.length; i++) {
              this.categoryIds.push(response.data[i].categoryId);
              this.categoryNames.push(response.data[i].name);
            }
          })
          .catch((error) => {
            this.error = error;
            this.errorFlag = true;
          });
      },
      editPetition: function (id) {
        var jsonObject = {};
        if (this.newTitle != this.petition.title) {
          jsonObject['title'] = this.newTitle;
        }
        if (this.newTitle == "") {
          alert("Title cannot be empty!")
          return;
        }
        if (this.newDescription != this.petition.description) {
          jsonObject['description'] = this.newDescription;
        }
        if (this.newDescription == "") {
          alert("Description cannot be empty!")
          return;
        }
        if (this.categorySelect != this.petition.category) {
          jsonObject['categoryId'] = this.categoryIds[this.categoryNames.indexOf(this.categorySelect)];
        }
        if (this.date != null) {
          jsonObject['closingDate'] = this.date;
        }

        if (this.petitionPhoto !== null) {
          this.uploadPetitionPhoto(id);
        }
        this.$http.patch('http://localhost:4941/api/v1/petitions/' + id, jsonObject,
          { headers: {
            'Content-Type': 'application/json',
            'X-Authorization': localStorage.getItem("authToken")
        }})
          .then((response) => {
            $('#editPetitionModal').modal('hide');

          })
          .catch((error) => {
            this.error = error;
            this.errorFlag = true;
          });
        location.reload();
      },
      photoProcessing: function(event) {
        this.petitionPhoto = event.target.files[0];
      },
      uploadPetitionPhoto: function (id) {
        console.log(localStorage.getItem("authToken"));
        this.$http.put('http://localhost:4941/api/v1/petitions/' + id + '/photo', this.petitionPhoto,{
          headers: {
            'X-Authorization': localStorage.getItem("authToken"),
            'Content-Type': this.petitionPhoto.type
          }
        })
          .then((response) => {

          }).catch ((error) => {
          this.error = error;
          alert(error);
          this.errorFlag = true;
        });
      }
    }
  }
</script>

<style scoped>

</style>
