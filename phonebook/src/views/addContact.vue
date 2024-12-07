<template>
  <h2 class="text-center my-4 bg-green text-2xl ">
    ثبت مخاطب جدید
  </h2>
  <v-col class="flex bg-green-500/90 items-center justify-center">
    <router-link to="/" class="">
      <v-btn color="black">
        نمایش مخاطبین
      </v-btn>
    </router-link>
  </v-col>
  <div class="bg-black">
    <form @submit.prevent="submitData()">
      <v-text-field v-model="fullname" label="نام و نام خانوادگی" :label-size="42" />

      <v-text-field v-model="phoneNumber" label="شماره تلفن" />

      <v-text-field v-model="selectedDate" type="date" label="انتخاب تاریخ تولد" />
      <!-- <date-picker v-model="selectedDate" /> -->


      <v-switch v-model="isCoworker" color="primary" label="همکار" />
      <v-btn class="me-4 bg-success" type="submit">
        submit
      </v-btn>

      <v-btn class="bg-info" @click="handleReset()">
        clear
      </v-btn>
    </form>
    <v-btn @click="addData(allContactInfo)">
      Fake Data ( Null )
    </v-btn>
  </div>
  <ul>
    <li v-for="(item, index) in contactsStore.getContacts" :key="index">
      {{ item.fullname }} - {{ item.phoneNumber }} - {{ item.selectedDate }} - {{ item.isCoworker ? 'بله' : 'خیر' }}
      <br>
      <v-btn variant="outlined" color="red" @click="deleteContact(item.id)">
        حذف
      </v-btn>
    </li>
  </ul>
</template>

<script setup>
import DatePicker from 'vue3-persian-datetime-picker'

import { useContactStore } from '../stores/contacts.js';
import { ref } from 'vue'
import { Icon } from '@iconify/vue';

const contactsStore = useContactStore();



const fullname = ref('')
const phoneNumber = ref('')
const selectedDate = ref('');
const isCoworker = ref(false);

const shamsiDate = ref('')


const addData = (fakeData) => {
  contactsStore.addContact(fakeData)
  console.log(fakeData)
}


// const allContactInfo = computed(() => ({
//   id: contactsStore.contacts.length + 1,
//   fullname: fullname.value,
//   phoneNumber: phoneNumber.value,
//   selectedDate: selectedDate.value,
//   isCoworker: isCoworker.value

// }))

const submitData = () => {
  contactsStore.addContact(allContactInfo.value)
  console.log(contactsStore.contacts[contactsStore.contacts.length - 1]);

  handleReset()

}

const handleReset = () => {
  fullname.value = ''
  phoneNumber.value = ''
  selectedDate.value = ''
  isCoworker.value = false
}

const submitMyForm = () => {
  alert(fullname.value + '\n' + phoneNumber.value + '\n' + selectedDate.value + '\n hamkar:' + isCoworker.value)
  handleReset()
}
const AllContacts = ref([

])

const deleteContact = async (id) => {
  console.log('مخاطب' + contactsStore.contacts[id - 1].fullname + 'با موفقیت حذف شد');
  contactsStore.deleteContact(id);

};

</script>
<style scoped>
.myP {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.contactControllButtons {
  gap: 1rem;
}
</style>