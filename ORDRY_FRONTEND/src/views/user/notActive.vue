<template>
  <div class="home">
    <div class="logo">
      <img alt="Ordry logo" src="../../assets/ordry.png" />
      <h1>YOUR PERSONAL WAITER.</h1>
    </div>
    <p>
      Sie sind leider etwas zu früh dran ...
      <br />Die Küche hat demnächst geöffnet!
    </p>
  </div>
</template>

<script>
export default {
  name: "not-active"
};
</script>
<style scoped>
.home {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  height: 100%;
  align-items: center;
}
.logo {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10em 0 5em;
}
.logo img {
  width: 80%;
  max-width: 800px;
}
.home h1 {
  margin: 0;
  text-align: center;
  font-size: 4vw;
}
a {
  color: white;
  margin: 0.5em 0;
}
a:hover {
  color: #dc143c;
}
p {
  color: #fff;
  text-align: center;
  width: 80%;
}
</style>

