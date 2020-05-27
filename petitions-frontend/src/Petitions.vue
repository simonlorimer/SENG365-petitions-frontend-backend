<template>
  <v-app>
    <div>
      <br/><br/>
      <h1>Petitions Page</h1>

      <v-btn v-if="this.loggedIn" small color="success" type="button" class="btn btn-primary" data-toggle="modal"
             data-target="#CreatePetitionModal"><v-icon left>add_circle</v-icon>Create Petition</v-btn>

      <div v-if="this.loggedIn && this.myPetitions.length > 0">

        <h2>Manage My Petitions</h2>

        <template>
          <v-simple-table dark>
            <template v-slot:default>
              <thead>
              <tr>
                <th ></th>
                <th class="text-left">Title</th>
                <th class="text-left">Category</th>
                <th class="text-left">Signature Count</th>
                <th class="text-left"></th>
              </tr>
              </thead>
              <tbody>
                <tr v-for="each in myPetitions" :key="each.petitionId">
                  <td><div align="center" justify="center">
                    <v-img
                      :src="'http://localhost:4941/api/v1/petitions/' + each.petitionId + '/photo'"
                      lazy-src="https://i.imgur.com/wmo4bm6.jpg"
                      max-width="150"
                      max-height="150"
                    />
                  </div></td>
                  <td class="text-left">{{each.title}}</td>
                  <td class="text-left">{{each.category}}</td>
                  <td class="text-left">{{ each.signatureCount }}</td>
                  <td class="text-left">
                    <router-link :to="{ name: 'petition', params: { petitionId: each.petitionId}}"><v-btn small><v-icon left>search</v-icon>View Details</v-btn></router-link>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </template>
      </div>


      <div id="CreatePetition">
        <div class="modal fade" id="CreatePetitionModal" tabindex="-1" role="dialog"
             aria-labelledby="createPetitionModalLabel" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h4 class="modal-title" id="createPetitionModalLabel">Create Petition</h4>
              </div>
              <v-form v-on:submit.prevent="createPetition()"
                      ref="form"
                      v-model="valid"
                      lazy-validation
              >
                <div class="modal-body">
                  <v-text-field
                    v-model="title"
                    label="Title"
                    required
                  />
                  <v-text-field
                    v-model="description"
                    label="Description"
                    required
                  />
                  <v-select
                    v-model="selectCreatePetitionCategory"
                    :items="categoryNames"
                    label="Category"
                    required
                  />
                  <h3>Date (optional):</h3><br>

                  <v-date-picker
                    v-model="date"
                    width="290"
                    class="mt-4"
                    /><br>

                  <h3>Photo (optional):</h3>

                  <div style="text-align:center"

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
                  ><v-icon left>add_circle</v-icon>Create Petition
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

      <div>
        <div v-if="errorFlag" style="color: red">
          {{ error }}
        </div>
        <div id="petitions">
          <span><h2>Petition Results <v-btn small color="warning" type="button" class="btn btn-primary" data-toggle="modal"
                                           data-target="#filterPetitionModal"><v-icon left>hourglass_full</v-icon>Filter</v-btn></h2></span>

          <v-btn v-if="startIndexTag != 1" small @click="firstPage()"><v-icon right>arrow_back_ios</v-icon></v-btn>
          <v-btn small @click="decreaseStartIndex()"><v-icon left>keyboard_arrow_left</v-icon> {{this.startIndexTag}}</v-btn>

          <v-btn small  @click="increaseStartIndex()">{{this.startIndexTag + 1}} <v-icon right>keyboard_arrow_right</v-icon></v-btn>

          <br>

          <div class="modal fade" id="filterPetitionModal" tabindex="-1" role="dialog"
               aria-labelledby="filterPetitionModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="filterPetitionModalLabel">Filter Petitions</h5>
                </div>
                <v-form
                v-on:submit.prevent="getPetitions()"
                ref="form"
                v-model="valid"
                lazy-validation
                >
                <div class="modal-body">

                    <v-text-field
                      v-model="searchTitle"
                      label="Search by Title"
                    />

                    <v-select
                      v-model="selectCategory"
                      :items="categoryNames"
                      label="Search by Category"
                    />
                    <v-select
                      v-model="selectSort"
                      :items="sortBy"
                      label="Sort By"
                    />


                </div>
                <div class="modal-footer">
                  <v-btn
                    color="warning"
                    type="submit"
                    @click="resetStartIndex()"
                  ><v-icon left>hourglass_full</v-icon>Filter
                  </v-btn>
                  <v-btn data-dismiss="modal"><v-icon left>close</v-icon>Close</v-btn>

                </div>
                </v-form>
              </div>
            </div>
          </div>

          <template>
            <v-simple-table>
              <template v-slot:default>
                <thead>
                <tr>
                  <th class="text-left"></th>
                  <th class="text-left">Title</th>
                  <th class="text-left">Category</th>
                  <th class="text-left">Created By</th>
                  <th class="text-left">Signature Count</th>
                  <th></th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="petition in petitions" :key="petition.petitionId">
                  <td><v-img
                    :src="'http://localhost:4941/api/v1/petitions/' + petition.petitionId + '/photo'"
                    lazy-src="https://i.imgur.com/wmo4bm6.jpg"
                    max-width="150"
                    max-height="150"
                  /></td>
                  <td class="text-left">{{ petition.title }}</td>
                  <td class="text-left">{{ petition.category }}</td>
                  <td class="text-left">{{ petition.authorName }}</td>
                  <td class="text-left">{{ petition.signatureCount }}</td>
                  <td>
                    <router-link :to="{ name: 'petition', params: { petitionId: petition.petitionId}}"><v-btn small><v-icon left>search</v-icon>View Details</v-btn></router-link>
                  </td>
                </tr>
                </tbody>
              </template>
            </v-simple-table>
          </template>

            <!-- TODO Last Page Button -->

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
          valid: true,
          loggedIn: false,
          title: "",
          description: "",
          selectCreatePetitionCategory: null,
          date: null,
          startIndexTag: 1,
          startIndex: 0,
          count: 10,
          petitions: [],
          categoryIds: [],
          categoryNames: [],
          selectCategory: null,
          petition: null,
          petitionPhoto: null,
          petitionSignatures: [],
          searchTitle: "",
          selectSort: null,
          myPetitions: [],
          myName: null,
          myEmail: null,
          myCountry: null,
          myCity: null,
          sortBy: ["ALPHABETICAL_ASC", "ALPHABETICAL_DESC","SIGNATURES_ASC", "SIGNATURES_DESC"]
        }
      },
      mounted: function() {
        this.checkLogin();
        this.getMyPetitions();
        this.getPetitions();
        this.getCategories();
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
              this.loggedIn = true;
            }).catch ((error) => {
            this.loggedIn = false;
            localStorage.clear();
          });

        },
        getPetitions: function() {
          var url = new URL('http://localhost:4941/api/v1/petitions/');
          if (this.searchTitle != "") {
            url.searchParams.append("q", this.searchTitle)
          }
          if (this.selectCategory != null) {
            url.searchParams.append("categoryId", this.categoryIds[this.categoryNames.indexOf(this.selectCategory)])
          }
          if (this.selectSort != null) {
            url.searchParams.append("sortBy", this.selectSort)
          }
          url.searchParams.append("startIndex", this.startIndex)
          url.searchParams.append("count", "10");
          this.$http.get(url.toString())
          .then((response) => {
            this.petitions = response.data;
            $('#filterPetitionModal').modal('hide');
          })
          .catch((error) => {
            this.error = error;
            this.errorFlag = true;
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
        increaseStartIndex: function () {
          if (this.petitions.length < 10) {
            alert("The last page has been reached. There are no more results.")
          } else {
            this.startIndex += 10;
            this.startIndexTag += 1;
            this.getPetitions();
          }
        },
        decreaseStartIndex: function() {
          if (this.startIndex > 0) {
            this.startIndex -= 10;
            this.startIndexTag -= 1;
            this.getPetitions();
          }
          else {
            alert("You are already on the first page.")
          }
        },
        resetStartIndex: function() {
          this.startIndex = 0;
          this.startIndexTag = 1;
        },
        firstPage: function () {
          this.startIndex = 0;
          this.startIndexTag = 1;
          this.getPetitions();
        },
        createPetition: function () {
          var jsonObject = {};
          if (this.date != null) {
            var date = new Date(this.date);
            if (date < Date.now()) {
              alert("Invalid date. Please try again.")
              return;
            } else {
              jsonObject["closingDate"] = this.date;
            }
          }
          if (this.title === "") {
            alert("Please enter a valid title!")
          } else if (this.description === "") {
            alert("Please enter a valid email address!")
          } else if (this.selectCreatePetitionCategory == null) {
            alert("Please select a category!")
          }  else {
            jsonObject["title"] = this.title;
            jsonObject["description"] = this.description;
            jsonObject["categoryId"] = this.categoryIds[this.categoryNames.indexOf(this.selectCreatePetitionCategory)];
            this.$http.post('http://localhost:4941/api/v1/petitions', jsonObject,
              { headers: {
                  'Content-Type': 'application/json',
                  'X-Authorization': localStorage.getItem('authToken')
                }})
              .then((response) => {
                var petitionCreate = response.data.petitionId;
                if (this.petitionPhoto !== null) {
                  this.uploadPetitionPhoto(petitionCreate);
                }
                $('#CreatePetitionModal').modal('hide');
                this.resetFormData();
                this.$http.post('http://localhost:4941/api/v1/petitions/' + petitionCreate + '/signatures', {}, {
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
                  });
                location.reload();
              })
              .catch((error) => {
                this.error = error;
                this.errorFlag = true;
              });

          }
        },
        resetFormData: function () {
          this.title = "";
          this.description = "";
          this.selectCreatePetitionCategory = null;
          this.date = null;
        },
        getMyPetitions: function () {
          this.$http.get('http://localhost:4941/api/v1/petitions')
            .then((response) => {
              for (var i = 0; i < response.data.length; i++) {
                if (response.data[i].authorName === localStorage.getItem("name")) {
                  this.myPetitions.push(response.data[i]);
                }
              }
            })
            .catch((error) => {
              this.error = error;
              this.errorFlag = true;
            });
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
