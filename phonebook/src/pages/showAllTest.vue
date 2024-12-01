<script setup>
import Swal from "sweetalert2";
import { ref, reactive, onMounted } from "vue";
import moment from "moment-jalaali";
import Forms from "@/components/forms.vue";
import { onUpdated } from "vue";

const selectedContact = reactive({});
const dialogRegisterState = ref(false);
const dialogEditState = ref(false)




const MyLocalContacts = reactive([]);

// Fetch contacts from localStorage on component mount
onMounted(() => {
  const storedContacts = JSON.parse(localStorage.getItem("contacts")) || [];
  MyLocalContacts.splice(0, MyLocalContacts.length, ...storedContacts);
});

onUpdated(() => {
  const storedContacts = JSON.parse(localStorage.getItem("contacts")) || [];
  MyLocalContacts.splice(0, MyLocalContacts.length, ...storedContacts);
});

const convertNumbersToPersian = (text) => {
  const englishNumbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

  let result = text;
  for (let i = 0; i < englishNumbers.length; i++) {
    const regex = new RegExp(englishNumbers[i], "g");
    result = result.replace(regex, persianNumbers[i]);
  }
  return result;
};

const deleteContact = (id) => {
  // Retrieve the contacts array from localStorage
  const contactsFromStorage =
    JSON.parse(localStorage.getItem("contacts")) || [];
  let lastId = parseInt(localStorage.getItem("lastId")) || 0;

  // Filter out the contact with the given ID
  const updatedContacts = contactsFromStorage.filter(
    (contact) => contact.id !== id
  );

  Swal.fire({
    title: "آیا از حذف مخاطب اطمینان دارید؟",
    text: "اطلاعات حذف شده قابلیت بازیابی ندارند",
    icon: "warning",
    showCancelButton: true,
    cancelButtonText: "انصراف",
    confirmButtonText: "بله، حذف شود",
    background: "#374151",
    color: "white",
    iconColor: "#f03935",
    customClass: {
      cancelButton:
        "text-white !bg-gray-800 hover:!bg-gray-600  shadow-black !shadow-lg border-2 border-white rounded-lg text-lg font-semiBold",
      confirmButton:
        "text-white !bg-red-700 hover:!bg-red-600  shadow-black !shadow-lg border-2 border-white rounded-lg text-lg font-semiBold",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      // Update lastId only if the deleted ID matches it
      if (id === lastId) {
        if (updatedContacts.length > 0) {
          // Set lastId to the new maximum ID from the remaining contacts
          lastId = Math.max(...updatedContacts.map((contact) => contact.id));
        } else {
          // Reset lastId to 0 if no contacts remain
          lastId = 0;
        }
        localStorage.setItem("lastId", lastId);
      }
      // Save the updated array back to localStorage
      localStorage.setItem("contacts", JSON.stringify(updatedContacts));

      // Update the local reactive variable
      MyLocalContacts.splice(0, MyLocalContacts.length, ...updatedContacts);


      // Show success message
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
        color: "green",
      });
      Toast.fire({
        icon: "success",
        title: "مخاطب با موفقیت حذف شد",
      });
    }
  });
};

const toggleEditDialog = (item) => {
  Object.assign(selectedContact, item); 
  dialogEditState.value = !dialogEditState.value;

};
const toggleRegisterDialog = () => {
  dialogRegisterState.value = !dialogRegisterState.value;
};
</script>
<template>
  <div class="mx-auto mainContent h-full">
    <header class="titlePage">
      <div class="titleText">
        <h1 class="text-center py-8 text-3xl text-black font-semibold">
          دفترچه تلفن
        </h1>
      </div>
    </header>

    <div class="container mx-auto rounded-lg">
      <v-table class="the_table">
        <thead class=" ">
          <tr class="text-right bg-[#f9fafc] text-[#627080] text-lg">
            <th class="text-right">عملیات</th>
            <th class="text-right ">علاقه مندی ها</th>
            <th class="text-right ">مهارت ها</th>
            <th class="text-right">همکار</th>
            <th class="text-right">تاریخ تولد</th>
            <th class="text-right">شماره تلفن</th>
            <th class="text-right">نام و نام خانوادگی</th>
            <!-- <th class="text-right">پروفایل</th> -->
            <th class="text-right">شماره</th>
          </tr>
        </thead>

        <tbody class="bg-[#dddbdb] text-[#212222]">
          <tr
            v-for="(item, index) in MyLocalContacts"
            :key="index"
            class="text-right text-xl even:bg-gray-200 bg-gray-400/50 cursor-pointer hover:bg-sky-900/60 hover:text-white duration-100 select-none"
            @dblclick="toggleEditDialog(item)"
          >
            <td
              class="flex items-end justify-center gap-4"
            >
              <v-btn
                variant="elevated"
                elevation="2"
                prepend-icon="mdi-delete"
                @click="deleteContact(item.id)"
                class="bg-red-600/90 hover:bg-red-600/95"
              >
                حذف
              </v-btn>
              <v-btn
                variant="elevated"
                color="blue"
                prepend-icon="mdi-account"
                @click="toggleEditDialog(item,'DD')"
                class="bg-sky-600/90 hover:bg-sky-600/95"
              >
                ویرایش
              </v-btn>
            </td>
            <!-- <td><v-avatar image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ46h_tVzQko_iFjFWfde0epoO1f2eoILdU-Q&s"/></td> -->
            <td>{{ item.favorites ? item.favorites.join(' , ') : '' }}</td>
            <td>{{ item.skills ? item.skills.join(' , ') : '' }}</td>
            <td>{{ item.isCoworker ? "بله" : "خیر" }}</td>
            <td>
              {{
                convertNumbersToPersian(
                  moment(item.selectedDate).format("jYYYY/jMM/jDD")
                )
              }}
            </td>
            <td>{{ convertNumbersToPersian(item.phoneNumber) }}</td>
            <td>{{ item.fullname }}</td>
            <td>{{ index + 1 }}</td>
          </tr>
        </tbody>
      </v-table>
    </div>
    <div class="addNewContact w-full flex justify-end py-5 container mx-auto">
      <v-btn
        variant="elevated"
        elevation="3"
        color="green"
        size="large"
        @click="toggleRegisterDialog"
      >
        <v-icon left> mdi-plus </v-icon>
        ثبت مخاطب
      </v-btn>
      <Forms
        v-model:modelState="dialogRegisterState"
        title="ثبت مخاطب"
        :registerMode="true"
      />
    </div>
  </div>
  <Forms
    v-model:model-state="dialogEditState"
    title="ویرایش مخاطب"
    :editMode="true"
    :currentID="selectedContact.id"
    :allFormsFields="selectedContact"

  />
</template>

<style>
.mainContent {
  background-image: url(../assets/test.jpg);
  background-position: center;
  background-repeat: repeat;
}
.tableHeadings {
  background-color: red;
  padding: 20px;
}
.the_table {
  filter: drop-shadow(4px 4px 5px #777575);
}
.swal2-actions {
  flex-direction: row-reverse !important;
}
</style>
