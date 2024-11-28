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


const contactsStore = useContactStore();
const loading = ref(false)

const emit = defineEmits(['update:modelState', 'update:allFormsFields']);

// Local reactive variables
// const localFields = reactive({ ...props.allFormsFields });
watch(props.modelState,()=>{
  props.registerMode ? alert('Register Mode e ') : alert('Edit Mode ya smthng else')
})
 
onMounted(()=>{
  console.log('This Form Mounted!');
  
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

const state = reactive({
  form:{
    id:null,
    fullname: null,
    phoneNumber:null,
    selectedDate:null,
    isCoworker:false
  }
})




onMounted(() => {
  if (props.allFormsFields) {
    Object.assign(state.form, props.allFormsFields);
  }
  console.log("Initialized form data:", state.form);
});


const schema = yup.object({
  fullname: yup.string().required("نوشتن نام و نام خانوادگی الزامیست"),
  phoneNumber:yup.string().required("وارد کردن شماره تلفن الزامیست"),
  selectedDate:yup.string().required("وارد کردن تاریخ تولد الزامیست")
});


const { handleSubmit, resetForm } = useForm({
  validationSchema: schema,
  initialValues: state.form,
  validateOnMount: false,
  validateOnBlur: false, 
  initialErrors:false,
  initialTouched:false,
});

const { value: fullname } = useField("fullname");
const { value: phoneNumber } = useField("phoneNumber");
const { value: selectedDate } = useField("selectedDate");

const handleSubmitFormClick = handleSubmit( (item) => {
  props.registerMode ? submitData() : UpdateDialog(item)
});

// const handleSubmitFormClickByEdit =
//   handleSubmit( (item) => {
//   props.editMode ? UpdateDialog(item) :'?'

// });

const submitNewData = ()=>{
  // emit('update:modelState', false);
  state.form.fullname = fullname.value
  state.form.phoneNumber = phoneNumber.value
  state.form.selectedDate = selectedDate.value
  alert(state.form.fullname)
}






const submitData = () => {
  console.log('STATE FORM VALUE WAS ' + state.form.isCoworker);
  
  loading.value = true
  const registerContactInfo = {
    id: contactsStore.contacts.length + 1,
    phoneNumber: phoneNumber.value,
    fullname: fullname.value,
    selectedDate: selectedDate.value,
    isCoworker: state.form.isCoworker,
  };
  // console.log(contactsStore.contacts.length + 1);
  console.log(registerContactInfo);

  setTimeout(() => {
    contactsStore.addContact(registerContactInfo)
    emit('update:modelState', false);
    

  },1500)


  setTimeout(() => {
    Swal.fire({
      icon: 'success',
      title: ' مخاطب با موفقیت ثبت شد',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
    // Reset form fields and validation state
    resetForm({
      values: { fullname: '', phoneNumber: '', selectedDate: '', isCoworker: false },
    });

    loading.value = false
  }, 1700);


}


const cancelDialog = () => {
console.log(state.form);

  emit('update:modelState', false);
  resetForm({
      values: { fullname: '', phoneNumber: '', selectedDate: '', isCoworker: false },
    });

  console.log(props.modelState);


};
const UpdateDialog = () => {
  const updatedContact = {
    id: props.currentData,
    phoneNumber: phoneNumber.value,
    fullname: fullname.value,
    selectedDate: selectedDate.value,
    isCoworker: state.form.isCoworker,
 
  };

  loading.value = true

  

  setTimeout(() => {
    contactsStore.updateContact(state.form.id, updatedContact);
    // console.log(idModel)
    console.log('↑ idish')
    console.log(updatedContact , state.form.id);

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
    
    });

  loading.value = false

  }, 1700);

}
watch(() => state.form.isCoworker, (newValue) => {
  state.form.isCoworker = newValue;
})

</script>
<template>
  <v-dialog
    v-model="props.modelState"
    max-width="800"
    class="bg-teal-400/0"
    @click:outside="cancelDialog"

  >
    <!-- :persistent="changePresistance" -->


    <v-card
      prepend-icon="mdi-account"
      :title="props.title"
      class="items-end "
    >
    <v-container>
      <v-card-text class="text-right bg-sky-700 w-full  ">
        <v-row class=" justify-end  bg-red-400  ">
          <v-col
            cols="24"
            md="4"
            sm="6"
            class="flex flex-col bg-black"
          >
            <v-text-field
              v-model="phoneNumber"
              label="شماره تلفن"
              placeholder="مثال : 09928717522"
            />
            <!-- :error-messages="phoneNumberError" -->

          <error-message name="phoneNumber" class=" text-red-500 text-center"></error-message>

          </v-col>

          <v-col
            cols="24"
            md="4"
            sm="6"
            class="flex flex-col w-full bg-white"
          >
            <v-text-field
              v-model="fullname"
              label="نام و نام خانوادگی"
              placeholder="مثال : علی علوی"
            />
          <error-message name="fullname" class=" text-red-500 text-center"></error-message>
          </v-col>
          <v-col cols="8">
            <date-picker
              v-model="selectedDate"
              format="YYYY-MM-DD"
              display-format="jYYYY-jMM-jDD"
              placeholder="تاریخ تولد خود را وارد کنید"

            />
          <error-message name="selectedDate" class="text-red-500 text-center"></error-message>

          </v-col>
          

          <v-col
            cols="8"
            class="d-flex justify-end"
          >
            <v-switch
              v-model="state.form.isCoworker"
              color="primary"
            >
              <template #label>
                <span class="text-gray-100 text-lg font-bold">همکار</span>
              </template>
            </v-switch>
          </v-col>
        </v-row>
        <v-col
          cols="12"
          class="mb-2 flex justify-start  "
        >
          <v-row class="gap-4 justify-end">
            <v-btn
              variant="flat"
              color="red"
              @click="cancelDialog()"
              :disabled="loading"
            >
              انصراف
            </v-btn>

            <v-btn
              v-if="props.editMode"
              :loading="loading"
              variant="flat"
              type="submit"
              color="green"
              @click="handleSubmitFormClick(currentData)"
            >
              اعمال تغییرات
            </v-btn>

            <v-btn
              v-if="props.registerMode"
              :loading="loading"
              variant="flat"
              color="green"
              @click="handleSubmitFormClick()"
            >
              ثبت مخاطب
            </v-btn>
          </v-row>
        </v-col>
      </v-card-text>
    </v-container>

    </v-card>
  </v-dialog>
</template>

<style scoped>

</style>