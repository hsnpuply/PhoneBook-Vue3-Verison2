<script setup>
import { ref, watch, computed , reactive, onMounted, onUpdated } from 'vue';
import { useContactStore } from '../stores/contacts.js';
import Swal from "sweetalert2";
import * as yup from 'yup';
import { Form, Field, ErrorMessage } from 'vee-validate';
import { useField, useForm } from "vee-validate";

const props = defineProps({
  title: String,
  modelState: Boolean,
  openMyDialog: Function,
  editMode: Boolean,
  registerMode: Boolean,
  currentData: Number,
  UpdateDialog: Function,
  allFormsFields:Object
})

const state = reactive({
  form:{
    id:null,
    fullname: null,
    phoneNumber:null,
    selectedDate:null,
    isCoworker:false
  }
})


const loading = ref(false)

const emit = defineEmits(['update:modelState', 'update:allFormsFields']);

watch(props.modelState,()=>{
  // props.registerMode ? alert('Register Mode e ') : alert('Edit Mode ya smthng else')
})
 


onUpdated(()=>{
console.log('the id :',props.currentData);

if (props.allFormsFields && props.editMode) {
    Object.assign(state.form, props.allFormsFields);
  }
  if(props.currentData){
    phoneNumber.value = state.form.phoneNumber
    fullname.value = state.form.fullname
    selectedDate.value = state.form.selectedDate
  }

  console.log("Updated form data:", state.form);

})






onMounted(() => {
  if (props.allFormsFields) {
    Object.assign(state.form, props.allFormsFields);
  }
  console.log("Initialized form data:", state.form);
});


const schema = yup.object({
  fullname: yup.string().required("نوشتن نام و نام خانوادگی الزامیست").min(6,'کمترین مقدار 6 حرف میباشد').max(36,'بیشترین مقدار 36 کارکتر میباشد'),
  phoneNumber:yup.string().required("وارد کردن شماره تلفن الزامیست").matches(/^09[0-9]{9}$/, "شماره تلفن باید با 09 شروع شده و شامل 11 رقم باشد"),
  selectedDate:yup.string().required("وارد کردن تاریخ تولد الزامیست")
});


const { handleSubmit, resetForm } = useForm({
  validationSchema: schema,
  initialValues: state.form,
  validateOnMount: false,
  validateOnBlur: true, 
  initialErrors:false,
  initialTouched:false,
});

const { value: fullname } = useField("fullname");
const { value: phoneNumber } = useField("phoneNumber");
const { value: selectedDate } = useField("selectedDate");

const handleSubmitFormClick = handleSubmit( (item) => {
  props.registerMode ? submitData() : UpdateDialog(item)
});

const submitData = () => {
  loading.value = true;

  // Retrieve the last used ID from localStorage or initialize it to 0
  let lastId = parseInt(localStorage.getItem('lastId')) || 0;

  // Increment the ID for the new contact
  const newId = lastId + 1;

  const registerContactInfo = {
    id: newId, // Use the new ID
    phoneNumber: phoneNumber.value,
    fullname: fullname.value,
    selectedDate: selectedDate.value,
    isCoworker: state.form.isCoworker,
  };


  // Store new contact in localStorage
  const contactsFromStorage = JSON.parse(localStorage.getItem('contacts')) || [];
  contactsFromStorage.push(registerContactInfo); // Add the new contact
  localStorage.setItem('contacts', JSON.stringify(contactsFromStorage)); // Save to localStorage

  // Update the last used ID in localStorage
  localStorage.setItem('lastId', newId);

  setTimeout(() => {
    emit('update:modelState', false);
  }, 1500);

  setTimeout(() => {
    Swal.fire({
      icon: 'success',
      title: ' مخاطب با موفقیت ثبت شد',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      color:'green',
      background:'#dddbd',
      timerProgressBar: true,
    });

    // Reset form fields and validation state
    resetForm({
      values: { fullname: '', phoneNumber: '', selectedDate: '', isCoworker: false },
    });
    state.form.isCoworker=false;

    loading.value = false;
  }, 1700);
};
const cancelDialog = () => {
if(!loading.value){
  emit('update:modelState', false);
  resetForm({
      values: { fullname: '', phoneNumber: '', selectedDate: '', isCoworker: false },
    });
    state.form.isCoworker=false;
  console.log(props.modelState);
}
console.log(state.form);
};

const UpdateDialog = () => {
  const updatedContact = {
    id: props.currentData,
    phoneNumber: phoneNumber.value,
    fullname: fullname.value,
    selectedDate: selectedDate.value,
    isCoworker: state.form.isCoworker,
  };

  loading.value = true;

  // Update the contact in localStorage
  const contactsFromStorage = JSON.parse(localStorage.getItem('contacts')) || [];
  const contactIndex = contactsFromStorage.findIndex(contact => contact.id === props.currentData);

  if (contactIndex !== -1) {
    contactsFromStorage[contactIndex] = updatedContact; // Update the existing contact
    localStorage.setItem('contacts', JSON.stringify(contactsFromStorage)); // Save the updated contacts
  }

  setTimeout(() => {
    emit('update:modelState', false);
  }, 1500);

  setTimeout(() => {
    Swal.fire({
      icon: 'success',
      title: ' مخاطب ویرایش  شد',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      color:'green'
    });

    loading.value = false;
    resetForm({
      values: { fullname: '', phoneNumber: '', selectedDate: '', isCoworker: false },
    });
  }, 1700);

};


watch(() => state.form.isCoworker, (newValue) => {
  state.form.isCoworker = newValue;
})

</script>
<template>
  <v-dialog
    v-model="props.modelState"
    max-width="600"
    class="bg-gray-400/20 "
    transition="dialog-bottom-transition"
    persistent="true"
    @click:outside="cancelDialog"
  >
    <!-- :persistent="changePresistance" -->


    <v-card
      prepend-icon="mdi-account"
      :title="props.title"
      class=" flex items-end justify-center bg-gray-700 !shadow-md  !shadow-black  "
    >
      <v-card-text class="text-right  w-full   mt-2  ">
        <div class="flex flex-col items-end w-full">

          <v-text-field
              v-model="fullname"
              label="نام و نام خانوادگی"
              placeholder="مثال : علی علوی"
              class="text-right w-full"
            />
          <error-message name="fullname" class=" text-red-500 text-center pb-4 -pt-8"></error-message>
        </div>
        <div class="flex flex-col items-end w-full">

          <v-text-field
              v-model="phoneNumber"
              label="شماره تلفن"
              placeholder="مثال : 09928717522"
              class="w-full"
            />
            <!-- :error-messages="phoneNumberError" -->

          <error-message name="phoneNumber" class=" text-red-500 text-center pb-4 -pt-8"></error-message>
          </div>

        <div class="flex flex-col items-end w-full ">
          <date-picker
              v-model="selectedDate"
              format="YYYY-MM-DD"
              display-format="jYYYY-jMM-jDD"
              placeholder="تاریخ تولد خود را وارد کنید"

              class=" text-lg w-full "

            />

            <error-message name="selectedDate" class="text-red-500 text-center pb-4 -pt-8"></error-message>
      
        </div>
        <div class="flex w-full items-end justify-end pt-4 ">

          <v-switch
              v-model="state.form.isCoworker"
              color="primary"
            >
              <template #label>
                <span class="text-gray-100 text-lg font-bold">همکار</span>
              </template>
            </v-switch>
        </div>

            <div class="operationButtons flex items-center justify-end gap-4 ">
              
            <v-btn
              variant="elevated"
              @click="cancelDialog()"
              :disabled="loading"
              size="large"
              class="bg-red-600/80 hover:bg-red-600/90"
            >
              انصراف
            </v-btn>

            <v-btn
              v-if="props.editMode"
              :loading="loading"
              variant="elevated"
              type="submit"
              color="green"
              size="large"
              @click="handleSubmitFormClick(currentData)"
            >
              اعمال تغییرات
            </v-btn>

            <v-btn
              v-if="props.registerMode"
              :loading="loading"
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

<style >
.vpd-body{
  background-color: rgba(0, 0, 0, 0.567);
}
.vpd-actions > buttons:hover{
  border-radius: 1rem;
}

.v-input {
  text-align: right !important;
}
.v-field__input{
  text-align: right !important;
}
.v-field-label{
  right: 0;
}
</style>