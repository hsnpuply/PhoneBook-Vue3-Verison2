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

const showAlert = (id) => {
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
      deleteContact(id)
      // console.log('hazf shod ')
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
    }
  });
}
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





const deleteContact = (id) => {
  contactsStore.deleteContact(id);
};


const loading = ref(false)



import moment, { now } from 'moment-jalaali';
import Forms from '@/components/forms.vue';

import { useForm, defineRule, configure } from 'vee-validate';
import * as yup from 'yup';

const titleStorage=ref('Stylish man')

localStorage.setItem('mood',titleStorage.value)



const titleHandler=ref('')

watch(titleHandler,(newValue)=>{
  titleHandler.value=newValue
  titleStorage.value=titleHandler.value
})

</script>
<template>
  <div class=" mx-auto mainContent min-h-[100vh]">
    <header class="titlePage ">
  <div class="titleText bg-black/50 p-2 ">
    <h1 class="text-center my-4 text-3xl text-black font-semibold ">
    دفترچه تلفن
    
  </h1>
  <v-text-field
              v-model="titleHandler"
              label="شماره تلفن"
              placeholder="مثال : 09928717522"
            />  </div>

</header>

    <div class="bg-warning ">
    <v-table >
      <thead class="bg-gray-500">
        <tr>
          <th class="text-right">
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
      <tbody class="">
        <tr
          v-for="(item, index) in contactsStore.contacts"
          :key="index"
          class="text-right text-xl  bg-gray-500/50 cursor-pointer hover:bg-blue-900 border-b-4  hover:border-black border-transparent select-none "
          @dblclick="toggleEditDialog(item)"
        >
          <td
            v-if="contact_state.length > 0"
            class=" flex justify-end w-full gap-2 border-none items-center "
          >
            <v-btn
              variant="flat"
              color="red"
              prepend-icon="mdi-delete"
              @click="showAlert(item.id)"
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
  <div class="addNewContact w-full flex justify-end py-5 px-3">
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
  background-image: url(../assets/bckground.png);
  background-position: center;
  background-repeat: repeat;
}
</style>