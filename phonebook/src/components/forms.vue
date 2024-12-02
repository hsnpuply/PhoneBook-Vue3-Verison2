<script setup>
import {ref, reactive, onMounted, onUpdated } from "vue";
import Swal from "sweetalert2";
import * as yup from "yup";
import { ErrorMessage } from "vee-validate";
import { useField, useForm } from "vee-validate";

const dataPassPermission =ref(true)

// const fileInputs = ref('')
const fileInputs = ref(null);

const props = defineProps({
  title: String,
  modelState: Boolean,
  editMode: Boolean,
  registerMode: Boolean,
  currentID: Number,
  UpdateDialog: Function,
  allFormsFields: Object,
});

const state = reactive({
  form: {
    id: null,
    fullname: null,
    phoneNumber: null,
    selectedDate: null,
    avatar:null,
    skills:[],
    favorites:[],
    isCoworker: false,
  },
  loading: false,
});

const SkillsItem =reactive([
  'Vue3 JS', 'React Js', 'Angular', 'PHP', 'Laravel', 'Tailwind' , 'Node Js'
])

const favsList=reactive([
  'شنا','بازی های فکری',
  'بدنسازی','بازی های کامپیوتری',
  'بوکس','فوتسال',
  'سینما','فوتبال',
])
const emit = defineEmits(["update:modelState", "update:allFormsFields"]);


// ON UPDATE Component
onUpdated(() => {
  if (props.allFormsFields && props.editMode && dataPassPermission.value) {
    Object.assign(state.form, props.allFormsFields);    
  }
  
  if (props.currentID && dataPassPermission.value) {
    phoneNumber.value = state.form.phoneNumber;
    fullname.value = state.form.fullname;
    selectedDate.value = state.form.selectedDate;
    skills.value = state.form.skills;
    favorites.value = state.form.favorites
    avatar.value = state.form.avatar;
    console.log(avatar.value);
    



  }


});

onMounted(() => {
  if (props.allFormsFields) {
    Object.assign(state.form, props.allFormsFields);
  }
}); 

// const schema = yup.object({
//   fullname: yup
//     .string()
//     .required("نوشتن نام و نام خانوادگی الزامیست")
//     .min(6, "کمترین مقدار 6 حرف میباشد")
//     .max(36, "بیشترین مقدار 36 کارکتر میباشد"),
//   phoneNumber: yup
//     .string()
//     .required("وارد کردن شماره تلفن الزامیست")
//     .matches(/^09[0-9]{9}$/, "شماره تلفن باید با 09 شروع شده و شامل 11 رقم باشد"),
//   selectedDate: yup.string().required("وارد کردن تاریخ تولد الزامیست"),
// });

const schema = yup.object({
  fullname: yup
    .string(),
  phoneNumber: yup
    .string(),
});
const { handleSubmit, resetForm } = useForm({
  validationSchema: schema,
  initialValues: state.form,
  validateOnMount: false,
  validateOnBlur: true,
  initialErrors: false,
  initialTouched: false,
});

const { value: fullname } = useField("fullname");
const { value: phoneNumber } = useField("phoneNumber");
const { value: selectedDate } = useField("selectedDate");
const { value: skills } = useField("skills");
const { value: favorites } = useField("favorites");
const { value: avatar } = useField("avatar");


const handleSubmitFormClick = handleSubmit((item) => {
  props.registerMode ? submitData() : UpdateDialog(item);

  // can be switch when more forms should be appeared
});

const submitData = () => {
  state.loading = true;

  // Retrieve the last used ID from localStorage or initialize it to 0
  let lastId = parseInt(localStorage.getItem("lastId")) || 0;

  // Increment the ID for the new contact
  const newId = lastId + 1;


   const avatarFile = avatar.value instanceof File ? avatar.value : null;
   const avatarUrl = avatarFile
     ? URL.createObjectURL(avatarFile)
     : "default-avatar.png"; // Fallback to a default avatar if none is provided


  const registerContactInfo = {
    id: newId, // Use the new ID
    phoneNumber: phoneNumber.value,
    fullname: fullname.value,
    selectedDate: selectedDate.value,
    isCoworker: state.form.isCoworker,
    skills:skills.value,
    favorites:favorites.value,
    avatar: avatarUrl

  };

  // Store new contact in localStorage
  const contactsFromStorage = JSON.parse(localStorage.getItem("contacts")) || [];
  contactsFromStorage.push(registerContactInfo); // Add the new contact
  localStorage.setItem("contacts", JSON.stringify(contactsFromStorage)); // Save to localStorage

  // Update the last used ID in localStorage
  localStorage.setItem("lastId", newId);

  setTimeout(() => {
    emit("update:modelState", false);
  }, 1200);

  setTimeout(() => {
    Swal.fire({
      icon: "success",
      title: " مخاطب با موفقیت ثبت شد",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      color: "green",
      background: "#dddbd",
      timerProgressBar: true,
    });

    // Reset form fields and validation state
    resetForm({
      values: { fullname: "", phoneNumber: "", selectedDate: "", isCoworker: false , skills:[],favorites:[] },
    })
    state.form.isCoworker = false;
    fileInputs.value = null; // Reset file input  
    state.loading = false;
  }, 1700);
};
const cancelDialog = () => {
  if (!state.loading) {
    emit("update:modelState", false);
    resetForm({
      values: { fullname: "", phoneNumber: "", selectedDate: "", isCoworker: false },
    });
    state.form.isCoworker = false;
  }
};

const UpdateDialog = () => {
  
  dataPassPermission.value=false
  const updatedContact = {
    id: props.currentID,
    phoneNumber: phoneNumber.value,
    fullname: fullname.value,
    selectedDate: selectedDate.value,
    skills:skills.value,
    favorites:favorites.value,
    avatar:state.form.avatar,
    isCoworker: state.form.isCoworker
  };
  
  state.loading = true;
  
  
  // Update the contact in localStorage
  const contactsFromStorage = JSON.parse(localStorage.getItem("contacts")) || [];
  const contactIndex = contactsFromStorage.findIndex(
    (contact) => contact.id === props.currentID
  );
  
  if (contactIndex !== -1) {
    contactsFromStorage[contactIndex] = updatedContact; // Update the existing contact
    localStorage.setItem("contacts", JSON.stringify(contactsFromStorage)); // Save the updated contacts
    console.log(contactsFromStorage[contactIndex]);
    
  }
  setTimeout(() => {
    emit("update:modelState", false);
  }, 1500);
  
  setTimeout(() => {
    Swal.fire({
      icon: "success",
      title: " مخاطب ویرایش  شد",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      color: "green",
    });

    state.loading = false;

    dataPassPermission.value=true

  }, 1700);


};





</script>
<template>
  <v-dialog
    v-model="props.modelState"
    max-width="600"
    class="bg-gray-400/20"
    transition="dialog-bottom-transition"
    :persistent="state.loading"
    @click:outside="cancelDialog"
  >
    <!-- :persistent="changePresistance" -->

    <v-card
      prepend-icon="mdi-account"
      :title="props.title"
      class="flex items-end justify-center bg-gray-700 !shadow-md !shadow-black"
    >
      <v-card-text class="text-right w-full mt-2">


        <div class="flex flex-col items-end w-full">
          <v-text-field
            autofocus
            v-model="fullname"
            label="نام و نام خانوادگی"
            placeholder="مثال : علی علوی"
            class="text-right w-full"
          />
          <error-message
            name="fullname"
            class="text-red-500 text-center pb-4 -pt-8"
          ></error-message>
        </div>
        <div class="flex flex-col items-end w-full">
          <v-text-field
            v-model="phoneNumber"
            label="شماره تلفن"
            placeholder="مثال : 09928717522"
            class="w-full"
          />
          <!-- :error-messages="phoneNumberError" -->

          <error-message
            name="phoneNumber"
            class="text-red-500 text-center pb-4 -pt-8"
          ></error-message>
        </div>

        <div class="flex flex-col items-end w-full">
          <date-picker
            v-model="selectedDate"
            format="YYYY-MM-DD"
            display-format="jYYYY-jMM-jDD"
            placeholder="تاریخ تولد خود را وارد کنید"
            class="text-lg w-full"
          />

          <error-message
            name="selectedDate"
            class="text-red-500 text-center pb-4 -pt-8"
          ></error-message>
        </div>

        <div class="flex flex-col items-end w-full mt-6">
          <v-file-input
            v-model="avatar"
            accept="image/png, image/jpeg, image/bmp"
            label="پروفایل"
            placeholder="عکسی برای پروفایل انتخاب کنید"
            prepend-icon="mdi-camera"
            class="w-full"
          />
        </div>
        <div class="flex flex-col items-end w-full mt-4">
          <v-combobox
            chips
            multiple
            v-model="skills"
            item-color="green"
            label="مهارت ها"
            :items="SkillsItem"
            variant="outlined"
            class="w-full !text-2xl"
          />
        </div>

        <div class="flex flex-col items-end w-full ">
          <v-autocomplete
            clearable
            v-model="favorites"
            chips
            multiple
            label="علاقه مندی"
            :items="favsList"
            class="w-full !text-2xl"

          />
        </div>

        <div class="flex w-full items-end justify-end pt-4">
          <v-switch v-model="state.form.isCoworker" color="primary">
            <template #label>
              <span class="text-gray-100 text-lg font-bold">همکار</span>
            </template>
          </v-switch>
        </div>

        <div class="operationButtons flex items-center justify-end gap-4">
          <v-btn
            variant="elevated"
            :disabled="state.loading"
            @click="cancelDialog()"
            size="large"
            class="bg-red-600/80 hover:bg-red-600/90"
          >
            انصراف
          </v-btn>

          <v-btn
            v-if="props.editMode"
            :loading="state.loading"
            variant="elevated"
            type="submit"
            color="green"
            size="large"
            @click="handleSubmitFormClick(currentID)"
          >
            اعمال تغییرات
          </v-btn>

          <v-btn
            v-if="props.registerMode"
            :loading="state.loading"
            variant="elevated"
            color="green"
            size="large"
            @click="handleSubmitFormClick()"
          >
            ثبت مخاطب
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style>
.vpd-body {
  background-color: rgba(0, 0, 0, 0.567);
}
.vpd-actions > buttons:hover {
  border-radius: 1rem;
}

.v-input {
  text-align: right !important;
}
.v-field__input {
  text-align: right !important;
}
.v-field-label {
  right: 0;
}

</style>
