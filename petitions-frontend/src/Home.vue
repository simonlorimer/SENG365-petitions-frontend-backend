<template>
  <v-app>
    <br/><br/><br/><br/>
    <h1>Welcome to MakePetitions</h1>
    <br/>
    <h3>MakePetitions is a website that allows you create a petition and make a difference. Now.</h3>
    <br/>

    <router-link :to="{ name: 'petitions'}"><v-btn large color="success"><v-icon left>search</v-icon>View Petitions</v-btn></router-link>

    <br/><br/>

    <footer>Created by Simon Lorimer 2020</footer>
  </v-app>
</template>

<script>
  export default {
    data() {
      return {

      }
    },
    mounted: function() {


    },
    methods: {

    }

  }
</script>

<style scoped>

</style>
