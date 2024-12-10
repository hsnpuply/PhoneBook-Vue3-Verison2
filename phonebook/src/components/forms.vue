<script setup>
import {ref, reactive, onMounted, onUpdated } from "vue";
import Swal from "sweetalert2";
import * as yup from "yup";
import { ErrorMessage } from "vee-validate";
import { useField, useForm } from "vee-validate";
import axios from 'axios';


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
  getData:Function,
  byLocalStorage:Boolean,
  mainTableKey:Number,
  fetchUsers:Function

});

const currentValue = ref(props.mainTableKey)

function incrementValue() {
  const newValue = currentValue.value + 1;
  emit('update:mainTableKey', newValue);
}

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
const emit = defineEmits(["update:modelState", "update:allFormsFields","update:mainTableKey"]);


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
    console.log(phoneNumber.value);
    



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
  if (props.registerMode) {
    props.byLocalStorage ? submitData()  : submitInServer();
  } else {
    props.byLocalStorage ? UpdateDialog(item) : updateInServer() ;
  }

  // می‌تواند به switch تغییر یابد در صورت نیاز به فرم‌های بیشتر
});


const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result);  // This is the Base64 string
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file); // Convert the image to Base64
  });
};

const submitData = async () => {
  state.loading = true;

  // Retrieve the last used ID from localStorage or initialize it to 0
  let lastId = parseInt(localStorage.getItem("lastId")) || 0;

  // Increment the ID for the new contact
  const newId = lastId + 1;


  let avatarBase64 = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRXrLfkPut6EaXDD0RpaHBzeqgScyncU5dkw&s"; // Default avatar if no file is selected
  if (avatar.value instanceof File) {
    try {
      avatarBase64 = await convertToBase64(avatar.value); // Wait for the conversion to finish
    } catch (error) {
      console.error("Error converting avatar to Base64:", error);
    }
  }

  const registerContactInfo = {
    id: newId, // Use the new ID
    phoneNumber: phoneNumber.value,
    fullname: fullname.value,
    selectedDate: selectedDate.value,
    isCoworker: state.form.isCoworker,
    skills:skills.value,
    favorites:favorites.value,
    avatar: avatarBase64

  };

  // Store new contact in localStorage
  const contactsFromStorage = JSON.parse(localStorage.getItem("contacts")) || [];
  contactsFromStorage.push(registerContactInfo); // Add the new contact
  localStorage.setItem("contacts", JSON.stringify(contactsFromStorage)); // Save to localStorage

  // Update the last used ID in localStorage
  localStorage.setItem("lastId", newId);
  props.getData()
  incrementValue()
  setTimeout(() => {
    emit("update:modelState", false);
    emit("update:mainTableKey", currentValue.value  + 10);
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
  // props.getData()

};
const submitInServer = async () => {
  state.loading = true;

  // If avatar is updated, convert it to Base64
  let avatarBase64 = state.form.avatar;
  if (avatar.value instanceof File) {
    try {
      avatarBase64 = await convertToBase64(avatar.value); // Convert to Base64 if a new avatar is selected
    } catch (error) {
      console.error("Error converting avatar to Base64:", error);
    }
  }

  // Prepare the data to be sent to the server
  const contactData = {
    phoneNumber: phoneNumber.value,
    fullname: fullname.value,
    selectedDate: selectedDate.value,
    skills: skills.value,
    favorites: favorites.value,
    avatar: avatarBase64, // Base64 avatar
    isCoworker: state.form.isCoworker,
  };

  try {
    // Send the data to the server
    const response = await axios.post('http://localhost:5000/users', contactData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Assuming the response contains the newly created contact, log it
    console.log('New contact added:', response.data);

    // Success Alert
    Swal.fire({
      icon: 'success',
      title: 'مخاطب با موفقیت ثبت شد',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      color: 'green',
      background: '#dddbd',
      timerProgressBar: true,
    });

    // Call the getData function to refresh data
    props.getData();

    // Close the dialog and reset the form
    setTimeout(() => {
      emit("update:modelState", false);
    emit("update:mainTableKey", currentValue.value  + 1);

    }, 1200);

    setTimeout(() => {
      resetForm({ values: { fullname: "", phoneNumber: "", selectedDate: "", isCoworker: false, skills: [], favorites: [] } });
      state.form.isCoworker = false;
      fileInputs.value = null; // Reset file input
      state.loading = false;
    }, 1700);
  } catch (error) {
    console.error("Error adding contact:", error);

    // Error Alert
    Swal.fire({
      icon: 'error',
      title: 'خطا در ثبت مخاطب',
      text: 'لطفاً دوباره تلاش کنید',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      color: 'red',
      background: '#f5dcdc',
      timerProgressBar: true,
    });

    state.loading = false;
  }
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

const UpdateDialog = async () => {
  
  dataPassPermission.value=false

// If avatar is updated, convert it to Base64
let avatarBase64 = state.form.avatar;
  if (avatar.value instanceof File) {
    try {
      avatarBase64 = await convertToBase64(avatar.value); // Convert to Base64
    } catch (error) {
      console.error("Error converting avatar to Base64:", error);
    }
  }
 
  const updatedContact = {
    id: props.currentID,
    phoneNumber: phoneNumber.value,
    fullname: fullname.value,
    selectedDate: selectedDate.value,
    skills: skills.value,
    favorites: favorites.value,
    avatar: avatarBase64, // Store Base64 avatar
    isCoworker: state.form.isCoworker,
  };

  state.loading = true;

  // Update the contact in localStorage
  const contactsFromStorage = JSON.parse(localStorage.getItem("contacts")) || [];
  const contactIndex = contactsFromStorage.findIndex(
    (contact) => contact.id === props.currentID
  );

  if (contactIndex !== -1) {
    contactsFromStorage[contactIndex] = updatedContact; // Update the contact
    localStorage.setItem("contacts", JSON.stringify(contactsFromStorage)); // Save updated contacts
    console.log("Updated contact:", contactsFromStorage[contactIndex]);
  }

  setTimeout(() => {
    emit("update:modelState", false);
  }, 1500);

  setTimeout(() => {
    Swal.fire({
      icon: "success",
      title: " مخاطب ویرایش شد",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      color: "green",
    });

    state.loading = false;
    dataPassPermission.value = true;
  }, 1700);
  props.getData()
};


const updateInServer = async () => {
  state.loading = true;

  dataPassPermission.value = false;


  // If avatar is updated, convert it to Base64
  let avatarBase64 = state.form.avatar;
  if (avatar.value instanceof File) {
    try {
      avatarBase64 = await convertToBase64(avatar.value); // Convert to Base64 if a new avatar is selected
    } catch (error) {
      console.error("Error converting avatar to Base64:", error);
    }
  }

  // Prepare the data to be updated
  const updatedContact = {
    id: props.currentID, // Ensure ID is passed for identifying the resource
    phoneNumber: phoneNumber.value,
    fullname: fullname.value,
    selectedDate: selectedDate.value,
    skills: skills.value,
    favorites: favorites.value,
    avatar: avatarBase64,
    isCoworker: state.form.isCoworker,
  };
  emit("update:mainTableKey", 208);

  try {
    // Update the contact on the server
    const response = await axios.patch(
      `http://localhost:5000/users/${props.currentID}`,
      updatedContact,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Contact updated successfully:", response.data);
    emit("update:mainTableKey", 208);


    // Show success feedback to the user
    Swal.fire({
      icon: "success",
      title: "مخاطب ویرایش شد",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      color: "green",
    });

    // Refresh the data in the parent component
    props.getData();
    

    // Close the dialog and reset the form
    setTimeout(() => {
      emit("update:modelState", false);
      emit("update:mainTableKey", 202);
    }, 1200);

    setTimeout(() => {
      resetForm({
        values: {
          fullname: "",
          phoneNumber: "",
          selectedDate: "",
          isCoworker: false,
          skills: [],
          favorites: [],
        },
      });
      // state.form.isCoworker = false;
      // fileInputs.value = null; // Reset file input
      dataPassPermission.value=true
      state.loading = false;
    }, 1700);
  } catch (error) {
    console.error("Error updating contact:", error);
    // await props.fetchUsers()

    // Show error feedback to the user
    Swal.fire({
      icon: "error",
      title: "خطا در ویرایش مخاطب",
      text: "لطفاً دوباره تلاش کنید",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      color: "red",
      background: "#f5dcdc",
      timerProgressBar: true,
    });

    state.loading = false;

  }
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
            @click="handleSubmitFormClick(state.form)"
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
