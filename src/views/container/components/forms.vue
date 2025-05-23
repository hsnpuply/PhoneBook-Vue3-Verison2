<script setup>
import { ref, reactive, onMounted, onUpdated, watch } from "vue";
import Swal from "sweetalert2";
import * as yup from "yup";
import { ErrorMessage } from "vee-validate";
import { useField, useForm } from "vee-validate";
import axios from "axios";

const dataPassPermission = ref(true);

const fileInputs = ref(null);

const props = defineProps({
  title: String,
  modelState: Boolean,
  editMode: Boolean,
  registerMode: Boolean,
  currentID: Number,
  UpdateDialog: Function,
  allFormsFields: Object,
  getData: Function,
  contactsPreview: String,
  mainTableKey: Number,
  users: Object,
});
const currentValue = ref(props.mainTableKey);

function incrementValue() {
  const newValue = currentValue.value + 1;
  emit("update:mainTableKey", newValue);
}

const state = reactive({
  form: {
    id: null,
    fullname: null,
    phoneNumber: null,
    selectedDate: null,
    avatar: null,
    skills: [],
    favorites: [],
    isCoworker: false,
  },
  loading: false,
});

const SkillsItem = reactive([
  "Vue3 JS",
  "React Js",
  "Angular",
  "PHP",
  "Laravel",
  "Tailwind",
  "Node Js",
]);

const favsList = reactive([
  "شنا",
  "بازی های فکری",
  "بدنسازی",
  "بازی های کامپیوتری",
  "بوکس",
  "فوتسال",
  "سینما",
  "فوتبال",
]);
const emit = defineEmits([
  "update:modelState",
  "update:allFormsFields",
  "update:mainTableKey",
  "update:users",
]);

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
    favorites.value = state.form.favorites;
    avatar.value = state.form.avatar;
    // console.log(phoneNumber.value);
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
  fullname: yup.string(),
  phoneNumber: yup.string(),
});

//   const schema = yup.object({
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

//   // New Fields for Validation
//   skills: yup
//     .array()
//     .min(1, "حداقل یک مهارت باید انتخاب شود")
//     .required("انتخاب مهارت الزامیست"),

//     avatar: yup
//   .mixed()
//   .required("آپلود تصویر پروفایل الزامی است")
//   .test('fileFormat', "از این فرمت برای پروفایل پشتیبانی نمیشود  فرمت های مورد تایید  : JPG-BMP-PNG ",
//     value => {
//       if (!value) return true;
//       const acceptedFormats = ['image/jpeg', 'image/png', 'image/bmp'];
//       return acceptedFormats.includes(value.type);
//     }
//   ).test('fileSize', "اندازه تصویر نباید از 2MB بیشتر باشد",
//     value => !value || (value.size / 1024 / 1024 < 2)  // 2MB limit
//   )
// });

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
  //
  if (props.registerMode) {
    // props.byLocalStorage ? submitData() : submitInServer();
    if (props.contactsPreview == "LocalStorage") {
      submitData();
    } else if (props.contactsPreview == "Server") {
      submitInServer();
    }
  } else if (props.editMode) {
    if (props.contactsPreview == "LocalStorage") {
      UpdateDialog(item);
    } else if (props.contactsPreview == "Server") {
      updateInServer();
    }
    // props.byLocalStorage ? UpdateDialog(item) : updateInServer();
  }

  // می‌تواند به switch تغییر یابد در صورت نیاز به فرم‌های بیشتر
});

const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result); // This is the Base64 string
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

  let avatarBase64 =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRXrLfkPut6EaXDD0RpaHBzeqgScyncU5dkw&s"; // Default avatar if no file is selected
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
    skills: skills.value,
    favorites: favorites.value,
    avatar: avatarBase64,
  };

  // Store new contact in localStorage
  const contactsFromStorage =
    JSON.parse(localStorage.getItem("contacts")) || [];
  contactsFromStorage.push(registerContactInfo); // Add the new contact
  localStorage.setItem("contacts", JSON.stringify(contactsFromStorage)); // Save to localStorage

  // Update the last used ID in localStorage
  localStorage.setItem("lastId", newId);

  setTimeout(() => {
    emit("update:modelState", false);
    emit("update:mainTableKey", currentValue.value + 10);
    props.getData();
    incrementValue();
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
      values: {
        fullname: "",
        phoneNumber: "",
        selectedDate: "",
        isCoworker: false,
        skills: [],
        favorites: [],
      },
    });
    state.form.isCoworker = false;
    fileInputs.value = null; // Reset file input
    state.loading = false;
  }, 1700);
  // props.getData()
};
const submitInServer = async () => {
  state.loading = true;
  emit("update:mainTableKey", 102);

  // If avatar is updated, convert it to Base64

  let avatarBase64 = state.form.avatar;

  // If the avatar is null or undefined, use a random or default avatar
  if (!avatarBase64) {
    const defaultAvatar =
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRXrLfkPut6EaXDD0RpaHBzeqgScyncU5dkw&s";
    avatarBase64 = defaultAvatar;
  }

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
    const response = await axios.post(
      "http://localhost:4000/users",
      contactData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    emit("update:mainTableKey", 208);

    // Assuming the response contains the newly created contact, log it
    // console.log("New contact added:", response.data);

    // Success Alert
    Swal.fire({
      icon: "success",
      title: "مخاطب با موفقیت ثبت شد",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      color: "green",
      background: "#dddbd",
      timerProgressBar: true,
    });

    // Close the dialog and reset the form
    setTimeout(() => {
      emit("update:modelState", false);
      emit("update:mainTableKey", currentValue.value + 1);
      // Call the getData function to refresh data
      props.getData();
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
      state.form.isCoworker = false;
      fileInputs.value = null; // Reset file input
      state.loading = false;
    }, 1700);
  } catch (error) {
    console.error("Error adding contact:", error);

    // Error Alert
    Swal.fire({
      icon: "error",
      title: "خطا در ثبت مخاطب",
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
    // await props.fetchUsers();
    // console.log("look we added a data on server");
  }
};

const cancelDialog = () => {
  if (!state.loading) {
    emit("update:modelState", false);
    resetForm({
      values: {
        fullname: "",
        phoneNumber: "",
        selectedDate: "",
        isCoworker: false,
      },
    });
    state.form.isCoworker = false;
  }
};

const UpdateDialog = async () => {
  dataPassPermission.value = false;

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
  const contactsFromStorage =
    JSON.parse(localStorage.getItem("contacts")) || [];
  const contactIndex = contactsFromStorage.findIndex(
    (contact) => contact.id === props.currentID
  );

  if (contactIndex !== -1) {
    contactsFromStorage[contactIndex] = updatedContact; // Update the contact
    localStorage.setItem("contacts", JSON.stringify(contactsFromStorage)); // Save updated contacts
    // console.log("Updated contact:", contactsFromStorage[contactIndex]);
  }

  setTimeout(() => {
    emit("update:modelState", false);
    props.getData();
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
      `http://localhost:4000/users/${props.currentID}`,
      updatedContact,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // console.log("Contact updated successfully:", response.data);
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

    // Close the dialog and reset the form
    setTimeout(() => {
      emit("update:modelState", false);
      emit("update:mainTableKey", 202);
      // Refresh the data in the parent component
      props.getData();
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
      dataPassPermission.value = true;
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
const testSerach = ref("");
const selectedID = ref("");
const searchQuery = ref("");
const suggestions = ref([]);

// it goes through api and fetch that  and code after this function fetching all users then use filter on it
// const fetchSuggestions = async (query) => {
//   if (!query || query.length < 3) {
//     suggestions.value = []
//     return
//   }
//   try {
//     const response = await fetch(
//       `http://localhost:4000/users?fullname=${query}`
//     )
//     console.log(response);

//     const data = await response.json()
//     console.log(data);

//     suggestions.value = data
//   } catch (error) {
//     console.error("Error fetching suggestions:", error)
//   }
// }

const fetchSuggestions = async (query) => {
  if (!query || query.length < 3) {
    suggestions.value = [];
    return;
  }
  try {
    // Fetch all users from the backend
    const response = await fetch("http://localhost:4000/users");
    console.log(response);

    const data = await response.json();
    console.log(data);

    // Filter users whose fullname includes the query substring (case-insensitive)
    suggestions.value = data.filter((user) =>
      user.fullname.toLowerCase().includes(query.toLowerCase())
    );
  } catch (error) {
    console.error("Error fetching suggestions:", error);
  }
};

// واکنش به تغییرات جستجو
watch(searchQuery, (newVal) => {
  fetchSuggestions(newVal);
});
watch(testSerach, (newVal) => {
  alert("TEST SEARCH AVTIVATEd" + newVal);
  console.log(newVal + " \n test Search");
});
//   const itemsq = ref([
//   { name: 'Vue.js', id: 1 },
//   { name: 'React', id: 2 },
//   { name: 'Angular', id: 3 },
//   { name: 'Svelte', id: 4 }
// ])
// const onSearch = (val) => {
//   console.log("User is typing: ", val)
//   // searchQuery.value += val
//   fetchSuggestions(val)

// }
</script>
<template>
  <v-dialog
    v-model="props.modelState"
    max-width="800"
    class="bg-gray-400/20"
    transition="dialog-bottom-transition"
    :persistent="state.loading"
    @click:outside="cancelDialog"
  >
    <v-card
      prepend-icon="mdi-account"
      :title="props.title"
      class="flex items-end justify-center bg-gray-700 !shadow-md !shadow-black"
    >
      <v-card-text class="text-right w-full mt-2">
        <v-stepper
          prev-text="مرحله قـبـل"
          next-text=" مرحله بـعـد"
          alt-labels
          editable
          :items="['1', '2', '3']"
        >
          <template v-slot:item.1>
            <v-card title="اطلاعات پایه" class="mb-4">
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
                  append-to="body"
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
            </v-card>
          </template>

          <template v-slot:item.2>
            <v-card title="اطلاعات شخصی">
              <div class="flex flex-col items-end w-full mt-6">
                <v-file-input
                  v-model="avatar"
                  accept="image/png, image/jpeg, image/bmp"
                  label="پروفایل"
                  placeholder="عکسی برای پروفایل انتخاب کنید"
                  prepend-icon="mdi-camera"
                  class="w-full"
                />
                <error-message
                  name="avatar"
                  class="text-red-500 text-center pb-4 -pt-8"
                ></error-message>
              </div>
            </v-card>
            <v-card title="وضعیت همکاری">
              <div class="flex w-full items-end justify-end pt-4">
                <v-switch v-model="state.form.isCoworker" color="primary">
                  <template #label>
                    <span class="text-gray-100 text-lg font-bold">همکار</span>
                  </template>
                </v-switch>
              </div>
            </v-card>
          </template>

          <template v-slot:item.3>
            <v-card title="مهارت ها و علاقمندی ها">
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
              <div class="flex flex-col items-end w-full">
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
              <v-autocomplete
                v-model="selectedID"
                :search="searchQuery"
                v-model:search="searchQuery"
                :items="suggestions"
                item-title="fullname"
                item-value="phoneNumber"
                return-object
                label="جست و جوی مخاطب"
                clearable
              />
              <div
                v-if="selectedID"
                class="p-4 bg-green-500 text-black font-semibold text-center"
              >
                <h3>{{ selectedID.id }} : آیدی</h3>
                <h3>{{ selectedID.phoneNumber }} : شماره تلفن</h3>
              </div>
              <div
                v-else
                class="p-4 bg-red-500 text-black font-semibold text-center"
              >
                <h3>هیچ مخاطبی انتخاب نشده</h3>
              </div>
            </v-card>
          </template>

        </v-stepper>

        <div class="operationButtons flex items-center justify-end gap-4 mt-5">
          <v-btn
            variant="elevated"
            :disabled="state.loading"
            @click="cancelDialog()"
            size="large"
            class="bg-red-600/80 hover:bg-red-600/90 ]"
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

<style></style>
