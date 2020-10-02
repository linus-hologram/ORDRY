<template>
  <div id="app">
    <!-- This router-view renders the main pages (Verwaltung, User, Küche, Kassa, Konfig) -->
    <router-view></router-view>
  </div>
</template>
<script>
export default {
  created() {
    window.onbeforeunload = function() {
      return "Are you sure you want to close the window?";
    };
    // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
    let vh = window.innerHeight * 0.01;
    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty("--vh", `${vh}px`);

    window.addEventListener("resize", function() {
      // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
      let vh = window.innerHeight * 0.01;
      // Then we set the value in the --vh custom property to the root of the document
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    });
    window.addEventListener("orientationchange", function() {
      // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
      let vh = window.innerHeight * 0.01;
      // Then we set the value in the --vh custom property to the root of the document
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    });
  }
};
</script>
<style>
@import "~animate.css";
/*Import of required google fonts for the project according to the screen design*/
/* @import url("https://fonts.googleapis.com/css?family=Raleway:400,500,600,700|Roboto:400,400i,500,700&display=swap"); */
/* roboto-regular - latin */
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 400;
  src: local("Roboto"), local("Roboto-Regular"),
    url("./assets/fonts/roboto-v20-latin-regular.woff2") format("woff2"),
    /* Chrome 26+, Opera 23+, Firefox 39+ */
      url("./assets/fonts/roboto-v20-latin-regular.woff") format("woff"); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}

/* roboto-italic - latin */
@font-face {
  font-family: "Roboto";
  font-style: italic;
  font-weight: 400;
  src: local("Roboto Italic"), local("Roboto-Italic"),
    url("./assets/fonts/roboto-v20-latin-italic.woff2") format("woff2"),
    /* Chrome 26+, Opera 23+, Firefox 39+ */
      url("./assets/fonts/roboto-v20-latin-italic.woff") format("woff"); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}

/* roboto-500 - latin */
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 500;
  src: local("Roboto Medium"), local("Roboto-Medium"),
    url("./assets/fonts/roboto-v20-latin-500.woff2") format("woff2"),
    /* Chrome 26+, Opera 23+, Firefox 39+ */
      url("./assets/fonts/roboto-v20-latin-500.woff") format("woff"); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}

/* roboto-700 - latin */
@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 700;
  src: local("Roboto Bold"), local("Roboto-Bold"),
    url("./assets/fonts/roboto-v20-latin-700.woff2") format("woff2"),
    /* Chrome 26+, Opera 23+, Firefox 39+ */
      url("./assets/fonts/roboto-v20-latin-700.woff") format("woff"); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}

/* raleway-regular - latin */
@font-face {
  font-family: "Raleway";
  font-style: normal;
  font-weight: 400;
  src: local("Raleway"), local("Raleway-Regular"),
    url("./assets/fonts/raleway-v14-latin-regular.woff2") format("woff2"),
    /* Chrome 26+, Opera 23+, Firefox 39+ */
      url("./assets/fonts/raleway-v14-latin-regular.woff") format("woff"); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}

/* raleway-500 - latin */
@font-face {
  font-family: "Raleway";
  font-style: normal;
  font-weight: 500;
  src: local("Raleway Medium"), local("Raleway-Medium"),
    url("./assets/fonts/raleway-v14-latin-500.woff2") format("woff2"),
    /* Chrome 26+, Opera 23+, Firefox 39+ */
      url("./assets/fonts/raleway-v14-latin-500.woff") format("woff"); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}

/* raleway-600 - latin */
@font-face {
  font-family: "Raleway";
  font-style: normal;
  font-weight: 600;
  src: local("Raleway SemiBold"), local("Raleway-SemiBold"),
    url("./assets/fonts/raleway-v14-latin-600.woff2") format("woff2"),
    /* Chrome 26+, Opera 23+, Firefox 39+ */
      url("./assets/fonts/raleway-v14-latin-600.woff") format("woff"); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}

/* raleway-700 - latin */
@font-face {
  font-family: "Raleway";
  font-style: normal;
  font-weight: 700;
  src: local("Raleway Bold"), local("Raleway-Bold"),
    url("./assets/fonts/raleway-v14-latin-700.woff2") format("woff2"),
    /* Chrome 26+, Opera 23+, Firefox 39+ */
      url("./assets/fonts/raleway-v14-latin-700.woff") format("woff"); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}

body {
  background-color: #000000;
  height: 100vh; /* ugly work-around to get flexbox layout with divs that fill the rest of the page to work*/
  height: calc(var(--vh, 1vh) * 100);
  margin: auto;
}
#app {
  font-family: "Roboto", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  height: 100%;
}

/* general stylings for the headings */
h1 {
  color: #ffffff;
  font-weight: 500;
  margin-left: 2%;
  font-size: 36px;
}
h2 {
  font-size: 30px;
  font-weight: 600;
  font-family: "Raleway";
}
p {
  font-size: 18px;
}

/* styling to create buttons with rounded corners. */
.btn-round {
  border-radius: 20px;
  color: #fff;
  background-color: #dc143c;
  border: none;
  cursor: pointer;
  padding: 0.5em 1em;
  font-size: 18px;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
}
.btn-round:hover:enabled {
  filter: brightness(130%);
  box-shadow: none;
}
.btn-round:disabled {
  cursor: not-allowed;
  background-color: #bdbdbd;
  box-shadow: none;
}

/*This removes browser generated focus outline from buttons and links */
button,
a:focus {
  outline: none;
}
button::-moz-focus-inner {
  border: 0;
}
</style>
