<template>
  <!-- the icon and color of the button can be set with props to make the button reuseable -->
  <button
    type="button"
    :style="{ backgroundColor: customColor }"
    :class="{'pulse': animated}"
    @click="animated = true"
    @animationend="animated = false"
  >
    <font-awesome-icon class="icon" :icon="icon" />
  </button>
</template>
<script>
export default {
  name: "iconButton",
  props: ["icon", "customColor"],
  data() {
    return {
      animated: false
    };
  }
};
</script>
<style scoped>
button {
  border-radius: 50%;
  min-height: 35px;
  min-width: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ffffff;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border: none;
}
button:disabled {
  visibility: hidden;
}

/* pulse animation when clicking the button */
.pulse {
  animation: pulse 0.5s;
}
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  30% {
    transform: scale(1.05);
  }
  50% {
    transform: scale(1.1);
  }
  70% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
/*This prevents hover styling on mobile devices. */
@media (hover: hover) {
  button:hover {
    filter: brightness(130%);
    box-shadow: none;
    cursor: pointer;
  }
}
</style>
