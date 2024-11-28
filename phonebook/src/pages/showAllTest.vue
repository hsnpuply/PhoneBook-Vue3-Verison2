<script setup>
import DatePicker from 'vue3-persian-datetime-picker'
import Swal from "sweetalert2";


const dialogMode = ref('')


const convertNumbersToPersian = (text) => {
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

  let result = text;
  for (let i = 0; i < englishNumbers.length; i++) {
    const regex = new RegExp(englishNumbers[i], 'g');
    result = result.replace(regex, persianNumbers[i]);
  }
  return result;
}

const date = ref('')

// const showAlert = (id) => {
//   Swal.fire({
//     title: "آیا از حذف مخاطب اطمینان دارید؟",
//     text: "اطلاعات حذف شده قابلیت بازیابی ندارند",
//     icon: "warning",
//     showCancelButton: true,
//     confirmButtonColor: "blue",
//     cancelButtonColor: "red",
//     confirmButtonText: "بله، حذف شود",
//     cancelButtonText: "انصراف",
//     customClass: {
//       cancelButton: "text-black text-lg font-semiBold",
//       confirmButton: "text-black text-lg font-semiBold"
//     }
//   }).then((result) => {
//     if (result.isConfirmed) {
//       deleteContact(id)
//       // console.log('hazf shod ')
//       const Toast = Swal.mixin({
//         toast: true,
//         position: "top-end",
//         showConfirmButton: false,
//         timer: 2500,
//         timerProgressBar: true,

//       });
//       Toast.fire({
//         icon: "success",
//         title: "مخاطب با موفقیت حذف شد"
//       });
//     }
//   });
// }
const deleteContact = (id) => {
  // Retrieve the contacts array from localStorage
  const contactsFromStorage = JSON.parse(localStorage.getItem('contacts')) || [];
  let lastId = parseInt(localStorage.getItem('lastId')) || 0;

  // Filter out the contact with the given ID
  const updatedContacts = contactsFromStorage.filter(contact => contact.id !== id);

  Swal.fire({
    title: "آیا از حذف مخاطب اطمینان دارید؟",
    text: "اطلاعات حذف شده قابلیت بازیابی ندارند",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "blue",
    cancelButtonColor: "red",
    confirmButtonText: "بله، حذف شود",
    cancelButtonText: "انصراف",
    customClass: {
      cancelButton: "text-black text-lg font-semiBold",
      confirmButton: "text-black text-lg font-semiBold"
    }
  }).then((result) => {
    if (result.isConfirmed) {
      // Update lastId only if the deleted ID matches it
      if (id === lastId) {
        if (updatedContacts.length > 0) {
          // Set lastId to the new maximum ID from the remaining contacts
          lastId = Math.max(...updatedContacts.map(contact => contact.id));
        } else {
          // Reset lastId to 0 if no contacts remain
          lastId = 0;
        }
        localStorage.setItem('lastId', lastId);
      }

      // Save the updated array back to localStorage
      localStorage.setItem('contacts', JSON.stringify(updatedContacts));

      // Update the local reactive variable
      MyLocalContacts.value = updatedContacts;

      // Show success message
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
      Toast.fire({
        icon: "success",
        title: "مخاطب با موفقیت حذف شد"
      });

      console.log(`Contact with ID ${id} deleted successfully.`);
      console.log(`Updated lastId: ${lastId}`);
    }
  });
};

import { ref, reactive, computed, onMounted, watch } from "vue";

import { useContactStore } from '../stores/contacts.js';

import { Icon } from '@iconify/vue';
import { fa } from 'vuetify/locale';

const selectedContact = ref({

});
const dialog = ref(false);
const dialogEditState = ref(false)
const dialogRegisterState = ref(false)
const changePresistance = ref(false)

const toggleEditDialog = (item) => {
  selectedContact.value = { ...item }
  dialogEditState.value = !dialogEditState.value;
  console.log(dialogEditState.value);
};
const toggleRegisterDialog = () => {
  dialogRegisterState.value = !dialogRegisterState.value;
  console.log(dialogRegisterState.value);
};



const confirmDelete = ref(false)

const contactsStore = useContactStore();
// contactsStore.getAllContacts() 
const allContacts = contactsStore.getContacts
const contact_state = contactsStore.contacts





// const deleteContact = (id) => {
//   contactsStore.deleteContact(id);
// };


const loading = ref(false)



import moment, { now } from 'moment-jalaali';
import Forms from '@/components/forms.vue';

import { useForm, defineRule, configure } from 'vee-validate';
import * as yup from 'yup';
import { onUpdated } from 'vue';



// Create a reactive variable to store contacts
const MyLocalContacts = ref([]);

// Fetch contacts from localStorage on component mount
onMounted(() => {
  const storedContacts = JSON.parse(localStorage.getItem('contacts')) || [];
  MyLocalContacts.value = storedContacts;
});

onUpdated(()=>{
  const storedContacts = JSON.parse(localStorage.getItem('contacts')) || [];
  MyLocalContacts.value = storedContacts;
})


</script>
<template>
  <div class=" mx-auto mainContent h-full">
    <header class="titlePage ">
  <div class="titleText ">
    <h1 class="text-center py-8 text-3xl text-black font-semibold ">
    دفترچه تلفن
    
  </h1>

              </div>

</header>

    <div class="container mx-auto">
    <v-table class=" rounded-lg" >
      <thead class=" ">
        <tr class="text-right bg-[#f9fafc] text-[#627080] text-lg">
          <th class=" text-right">
            عملیات
          </th>
          <th class="text-right">
            همکار
          </th>
          <th class="text-right">
            تاریخ تولد
          </th>
          <th class="text-right">
            شماره تلفن
          </th>
          <th class="text-right">
            نام و نام خانوادگی
          </th>
          <th class="text-right">شماره</th>
        </tr>
      </thead>
      <tbody class="bg-[#dddbdb] text-[#212222]">
        <tr
          v-for="(item, index) in MyLocalContacts"
          :key="index"
          class="text-right text-xl even:bg-red-500  bg-gray-500/50 cursor-pointer hover:bg-sky-900 hover:text-white duration-100 select-none "
          @dblclick="toggleEditDialog(item)"
        >
          <td
            v-if="contact_state.length > 0"
            class=" flex justify-end w-full gap-2  items-center  "
          >
            <v-btn
              variant="elevated"
              elevation="2"
              prepend-icon="mdi-delete"
              @click="deleteContact(item.id)"
              class="bg-red-700 text-orange-500"
            >
              حذف
            </v-btn>
            <v-btn
              variant="flat"
              color="blue"
              prepend-icon="mdi-account"
              @click="toggleEditDialog(item)"
            >
              ویرایش
            </v-btn>
          </td>
          <td>{{ item.isCoworker ? 'بله' : 'خیر' }}</td>
          <!-- <td>{{ moment(item.selectedDate).format('jYYYY/jMM/jDD') }}</td>
          <td>{{ item.phoneNumber }}</td> -->
          <td>{{ convertNumbersToPersian(moment(item.selectedDate).format('jYYYY/jMM/jDD')) }}</td>
          <td>{{ convertNumbersToPersian(item.phoneNumber) }}</td>
          <td>{{ item.fullname }}</td>
          <td>{{ item.id }}</td>
        </tr>
      </tbody>
    </v-table>
  </div>
  <div class="addNewContact w-full flex justify-end py-5 container mx-auto">
    <v-btn
      color="green"
      size="large"
      @click="toggleRegisterDialog"
    >
      <v-icon left>
        mdi-plus
      </v-icon>
      ثبت مخاطب
    </v-btn>
    <Forms
      v-model:model-state="dialogRegisterState"
      title="ثبت مخاطب"
      :register-mode="true"
    />
  </div>
  </div>
  <Forms
              v-model:model-state="dialogEditState"
              title="ویرایش مخاطب"
              :phone-model="selectedContact.phoneNumber"
              :fullname="selectedContact.fullname"
              :isCoworker="selectedContact.isCoworker"
              :selected-date="selectedContact.selectedDate"
              :edit-mode="true"
              :currentData="selectedContact.id"
              :allFormsFields="selectedContact"
            />


</template>


<style scoped>
.mainContent{
  background-image: url(../assets/test.jpg);
  background-position: center;
  background-repeat: repeat;
}
.tableHeadings {
  background-color: red;
  padding: 20px;
}
</style>