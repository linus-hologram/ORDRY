<template>
  <div class="checklist-form">
    <h2>{{ getTitel }}</h2>
    <form v-on:submit.prevent="onSubmit" enctype="multipart/form-data">
      <div class="fields">
        <label>Abschnitt:</label>
        <select
          v-model="$v.section.$model"
          id="category"
          :class="{'error': $v.section.$error, 'noerror': !$v.section.$error}"
        >
          <option value="-1" disabled selected hidden id="placeholder">auswählen</option>
          <option value="0">Konfiguration</option>
          <option value="1">Abschluss</option>
        </select>
        <span class="error-msg" v-if="$v.section.$error">
          <p>Bitte wählen Sie einen Abschnitt aus!</p>
        </span>
      </div>
      <div class="fields">
        <label>Beschreibung:</label>
        <textarea
          v-model="$v.description.$model"
          placeholder="Fügen Sie eine Beschreibung für die Aufgabe hinzu .."
          :class="{'error': $v.description.$error, 'noerror': !$v.description.$error}"
        ></textarea>
        <span class="error-msg" v-if="$v.description.$error">
          <p>Bitte geben Sie eine Beschreibung ein!</p>
        </span>
      </div>
      <div class="fields">
        <label>Bild hochladen:</label>
        <input
          type="file"
          ref="file"
          accept=".png, .jpg, .jpeg"
          @change="onSelect"
          :class="{'file-error': $v.file.$error, 'no-file-error': !$v.file.$error}"
        />
        <span class="error-msg" v-if="$v.file.$error">
          <p>Bitte wählen Sie ein Bild für die Aufgabe aus!</p>
        </span>
      </div>
      <span class="error-msg" v-if="error">
        <p>{{error}}</p>
      </span>
      <button class="btn-round" :disabled="$v.$invalid">Aufgabe speichern</button>
    </form>
  </div>
</template>

<script>
import { required, between } from "vuelidate/lib/validators";

export default {
  name: "checklist-form",
  props: ["checklistitem"],
  data() {
    return {
      item: null,
      file: "",
      description: "",
      section: -1,
      error: null
    };
  },
  validations() {
    return {
      file: {  },
      description: { required },
      section: { between: between(0, 1) }
    };
  },

  methods: {
    onSelect() {
      this.file = this.$refs.file.files[0];
      this.$v.file.$touch();
    },
    async onSubmit() {
      var formData = new FormData();
      formData.append("checklist-image", this.file);
      formData.append("title", this.description);
      formData.append("section", this.section);
      try {
        //source: https://blog.bitsrc.io/uploading-files-and-images-with-vue-and-express-2018ca0eecd0
        if (this.item != null) {
          formData.append("id", this.item._id);
          await this.$store.dispatch("checklist/updateItem", formData);
          // update
        } else {
          // create
          await this.$store.dispatch("checklist/createChecklistItem", formData);
        }
        //Afterwards the form gets resetted
        this.reset();
      } catch (err) {
        const errName = err.response.data;

        if (errName) {
          if (errName.error === "INCORRECT_FILETYPE") {
            this.error =
              "Ungültiger Dateityp! Bitte wählen Sie eine .jpeg, .jpg oder .png Datei.";
            console.log("File type incorrect!");
          } else if (errName.error === "LIMIT_FILE_SIZE") {
            this.error =
              "Zu große Datenmenge! Bitte wählen Sie eine kleinere Bilddatei aus.";
            console.log("File too big!");
          }
        } else {
          this.error =
            "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.";
          console.log("Error occured!", err);
        }

        this.message = "Ein Fehler ist aufgetreten.";
      }
    },
    reset() {
      this.file = "";
      this.$refs.file.value = "";
      this.description = "";
      this.message = "";
      this.section = -1;
      this.item = null;
      this.$v.$reset();
    }
  },
  computed: {
    getTitel: function() {
      return this.item == null ? "Aufgabe hinzufügen" : "Aufgabe bearbeiten";
    }
  },
  watch: {
    checklistitem: function(newItem) {
      if (newItem) {
        this.item = newItem;
        this.description = this.item.title;
        this.section = this.item.sectionId;
        this.file = this.item.imageId;
        this.$v.file.$touch();
      }
    }
  }
};
</script>

<style scoped>
.checklist-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 18px;
}
.checklist-form label {
  display: block;
}
.checklist-form form {
  width: 80%;
  display: flex;
  flex-grow: 1;
  flex-direction: column;
}
.checklist-form .btn-round {
  width: 100%;
  margin: auto 0 2em 0;
}
.checklist-form textarea {
  width: 100%;
  height: 8em;
  margin: 1em 0 0;
  font-family: "Roboto";
  font-size: 16px;
  border-radius: 10px;
  box-sizing: border-box;
  padding: 0.5em;
  resize: none;
}
.checklist-form input {
  font-size: 14px;
  margin: 1em 0 0;
}
.checklist-form select {
  background: url(../../assets/caret-down-solid.svg) no-repeat right;
  -webkit-appearance: none;
  background-position-x: 90%;
  color: #828282;
  cursor: pointer;
  width: 100%;
  border-radius: 20px;
  font-size: 16px;
  box-shadow: none;
  padding: 0.5em 1em;
  margin-top: 0.5em;
}
.fields {
  margin-bottom: 1.5em;
}
.noerror {
  border: 0.5px solid #000000;
}
.no-file-error {
  color: #000;
}
.error {
  border: 0.5px solid #dc143c;
}
.file-error {
  color: #dc143c;
}
.error-msg p {
  margin: 0 auto;
  color: #dc143c;
  font-size: 14px;
}
</style>