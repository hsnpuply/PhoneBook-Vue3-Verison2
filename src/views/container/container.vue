<script setup>
import Swal from "sweetalert2";
import { ref, reactive, onMounted, computed, watch, watchEffect } from "vue";
import moment from "moment-jalaali";
import Forms from "@/components/forms.vue";
import Card from "@/views/container/components/contact_card.vue";
import axios from "axios";
import { HalfCircleSpinner } from "epic-spinners";
import "animate.css";

import {
  convertNumbersToPersian as PersianNumberConvertorX,
  deleteLocalstorageContact as DeleteLocalStorageContacts,
} from "../../utilities/functions";
import ContactRecord from "./components/contactRecord.vue";
import Drawer from "./components/drawer.vue";

const loadingPreview = ref(true);

const byLocalStorage = ref(true);
// const skeletonLocalStorageLoadingState = ref(true);
// const skeletonServerLoadingState = ref(true);

// const selectedContact = reactive({});

// const dialogRegisterState = ref(false);
// const dialogEditState = ref(false);

const MyLocalContacts = reactive([]);
// changing to const gives an error
let users = reactive({});

// const loadingState = ref(false);

// all in STATE
const previewStatus = ref('LocalStorage')


const state = reactive({
  contacts:{
  LocalContacts:[],
  server_1_Contacts:[],
  contactsPreview:'LocalStorage',
  storedPreviewStatus:localStorage.getItem('Preview Status'),
    
  selectedContact:{},
  },
  forms:{
    register:false,
    edit:false,
  },
  loading:{
    preview:true,
    loadingStatus:false,
    skeletonLoads:{
    LocalContacts: true,
    server_1_Contacts: true
  }
  },
  mainTableKey: 0,
  
});

const storedPreviewStatus = localStorage.getItem('Preview Status');

watch(state.contacts.contactsPreview, (newValue) => {
  alert(state.contacts.contactsPreview)
  alert('something changed in contacts Preview')

  switch (newValue) {
    case 'LocalStorage':
    state.contacts.contactsPreview = 'LocalStorage'
    localStorage.setItem('Preview Status', state.contacts.contactsPreview);
    // byLocalStorage.value = true;
  break;
    case 'Server' :
    state.contacts.contactsPreview = 'Server'
    localStorage.setItem('Preview Status', state.contacts.contactsPreview);
    // byLocalStorage.value = false;
  }
})


onMounted(async () => {

  if (!localStorage.getItem('Preview Status')) {
    localStorage.setItem('Preview Status', 'LocalStorage');
    state.contacts.contactsPreview = 'LocalStorage'
    // byLocalStorage.value = true;
  }

  if (state.contacts.storedPreviewStatus == 'LocalStorage') {
    state.contacts.contactsPreview = 'LocalStorage'
    localStorage.setItem('Preview Status', state.contacts.contactsPreview);
    // byLocalStorage.value = true;
  } else if (state.contacts.storedPreviewStatus == 'Server') {
    state.contacts.contactsPreview = 'Server'
    localStorage.setItem('Preview Status', state.contacts.contactsPreview);
    // byLocalStorage.value = false;
  }
  getData();
  sekeletonLoadsLocal();
  sekeletonLoadsOnServer();
  await fetchUsers();
  // set To .5s
  setTimeout(() => {
    // loadingPreview.value = false;
    state.loading.preview = false;
    // state.loading.preview = false
  }, 500);
  setTimeout(() => {
    // loadingState.value = true;
    state.loading.loadingStatus = true;
    
  }, 500);
});

function updateMainTableKey(newValue) {
  state.mainTableKey = newValue;
}



const getData = async () => {
  // if (byLocalStorage.value) {
  //   const storedContacts = JSON.parse(localStorage.getItem("contacts")) || [];
  //   state.contacts.LocalContacts.splice(0, state.contacts.LocalContacts.length, ...storedContacts);

  // } else {
  //   fetchUsers();
  // }
  
  const storedContacts = JSON.parse(localStorage.getItem("contacts")) || [];
  switch(state.contacts.contactsPreview){
    case 'LocalStorage' :
    state.contacts.LocalContacts.splice(0, state.contacts.LocalContacts.length, ...storedContacts);
    // state.contacts.LocalContacts.push(...storedContacts)
    break;

    case 'Server' :
    await fetchUsers();
    break;

  }

};

const sekeletonLoadsLocal = () => {
  setTimeout(() => {
    // skeletonLocalStorageLoadingState.value = false;
    state.loading.skeletonLoads.LocalContacts = false;
  }, 2000);
};
const sekeletonLoadsOnServer = () => {
  setTimeout(() => {
    // skeletonServerLoadingState.value = false;
    state.loading.skeletonLoads.server_1_Contacts = false;

  }, 2000);
};

const deleteServerContact = async (id) => {
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
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:4000/users/${id}`); // Update with your server's base URL
        // users = users.filter((user) => user.id !== id); // Update the local list of users
        state.contacts.server_1_Contacts  = state.contacts.server_1_Contacts.filter((contact) => contact.id !== id); // Update the local list of users
        
        state.mainTableKey = state.mainTableKey + 1;
        // Show success notification
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
      } catch (error) {
        console.error("Error deleting user:", error);
        Swal.fire({
          title: "خطا در حذف مخاطب",
          text: "لطفاً دوباره تلاش کنید.",
          icon: "error",
          confirmButtonText: "تایید",
        });
      }
    }
  });
  UpdateDataServer();
  state.mainTableKey = state.mainTableKey + 1;
};

const toggleEditForm = (item) => {
  Object.assign(state.contacts.selectedContact, item);
  state.forms.edit = !state.forms.edit;
};
const toggleRegisterForm = () => {
  state.forms.register = !state.forms.register;
};

const UpdateStatusDataServer = ref(false);
const UpdateDataServer = async () => {
  if (UpdateStatusDataServer.value) {
     await fetchUsers();
  }
};

const fetchUsers = async () => {
  try {
    const response = await axios.get("http://localhost:4000/users"); // Replace with your actual URL
    users = response.data;
    state.contacts.server_1_Contacts = response.data;
    console.log(state.contacts.server_1_Contacts);
    
    // console.log(users);
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

const localStorageCondition = () => {
  if (
    state.contacts.LocalContacts.length > 0 &&
    !state.loading.skeletonLoads.LocalContacts &&
    state.contacts.contactsPreview == 'LocalStorage'
  ) {
    state.contacts.contactsPreview = 'LocalStorage'
    return true;
  }
};

const serverCondition = () => {
  if ( state.contacts.server_1_Contacts.length > 0 && !state.loading.skeletonLoads.server_1_Contacts && state.contacts.contactsPreview == 'Server') {
    state.contacts.contactsPreview = 'Server'
        return true;
  }
};

const drawer = ref(null);

const noContactPreview = computed(() => {
  if (state.contacts.LocalContacts.length === 0 && state.contacts.contactsPreview == 'LocalStorage') {
    return true;
  } else if (state.contacts.server_1_Contacts.length === 0 && state.contacts.contactsPreview == 'Server') {
    return true;
  }
  // console.log("one of them might having having Records");
  // console.log(users.length);

  return false;
});

const themeItems = ref(['آبی', 'سبز', 'زرد', 'بنفش'])

const getEmojiNodata = (contactsPreview)=>{
  switch (contactsPreview) {
    case 'LocalStorage':
      return '😲';
    case 'Server':
      return '😨';
    case 'Database':
      return '😎';
    case 'Cloud':
      return '☁️';
    default:
      return '❓'; // حالت پیش‌فرض
  }
}

const savingModeData = (contactsPreview)=>{
  switch (contactsPreview) {
    case 'LocalStorage':
      return 'مرورگر ';
    case 'Server':
      return 'سرور';
    case 'Database':
      return 'دیتابیس';
    case 'Cloud':
      return 'ابر';
    default:
      return 'محل نامشخص'; // حالت پیش‌فرض
  }
}

const getTitleEmoji = (contactsPreview)=>{
  switch (contactsPreview) {
    case 'LocalStorage':
      return 'mdi-web';
    case 'Server':
      return 'mdi-server';
    case 'Database':
      return 'mdi-database';
    case 'Cloud':
      return 'mid-cloud';
    default:
      return 'mdi-question-mark'; // حالت پیش‌فرض
  }
}

const changePreviewStatus = (status)=>{
  state.contacts.contactsPreview = status;
  localStorage.setItem('Preview Status', status);
  getData()
}
</script>
<template>
  <div class="w-full h-[100vh] flex items-center justify-center bg-black/20" v-if="!state.loading.loadingStatus">
    <half-circle-spinner :size="100" color="green" />
  </div>
  <div class="mx-auto mainContent h-full bg-cover" v-if="state.loading.loadingStatus">
    <header class="titlePage overflow-hidden">
      <div class="titleText animate__animated animate__fadeInUp animate__slow">
        <h1 class="text-center py-8 text-3xl text-black font-semibold flex items-center justify-center gap-2">
          <span class="mdi" :class="getTitleEmoji(state.contacts.contactsPreview)"></span>
           دفترچه
          تلفن {{ savingModeData(state.contacts.contactsPreview) }}
        </h1>
      </div>
    </header>

    <div class="container mx-auto rounded-lg">
      <div class="  px-4 my-2 text-center lg:!text-left 
         animate__animated animate__slow animate__fadeInLeft ">
        <div class="setting ">
          <span
            class=" cursor-pointer mdi mdi-cog text-3xl text-black inline-flex duration-700 ease-in-out hover:rotate-[180deg] origin-center"
            @click.stop="drawer = !drawer" />
        </div>

      </div>

      <v-table :class="state.loading.preview
        ? 'animate__animated animate__slow animate__delay-2s animate__fadeInLeft'
        : ''
        " class="the_table hidden xl:block" :key="state.mainTableKey">
        <thead class="relative">
          <tr class="text-right bg-[#f9fafc] text-[#627080] text-lg">
            <th class="text-right">شماره</th>
            <th class="text-right">پروفایل</th>
            <th class="text-right">نام و نام خانوادگی</th>
            <th class="text-right">شماره تلفن</th>
            <th class="text-right">تاریخ تولد</th>
            <th class="text-right">همکار</th>
            <th class="text-right">مهارت ها</th>
            <th class="text-right">علاقه مندی ها</th>
            <th class="text-right">عملیات</th>
          </tr>
        </thead>

        <!-- Skeleton of LocalStorage -->
        <tbody class="w-full" v-if="state.loading.skeletonLoads.LocalContacts">
          <tr v-for="(item, index) in state.contacts.LocalContacts.length" :key="index" class="bg-[#bcbfc5] even:bg-[#e5e7eb]">
            <td v-for="item in 8" :key="item" class="!h-28">
              <v-skeleton-loader type="text" color="transparent" class="">
              </v-skeleton-loader>
            </td>
            <td class="min-w-48">
              <div class="w-full px-8">
                <v-skeleton-loader type="button,button" color="transparent" class=" ">
                </v-skeleton-loader>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Skeleton of Server -->

        <tbody class="w-full" v-if="state.loading.skeletonLoads.server_1_Contacts">
          <tr v-for="(item, index) in state.contacts.server_1_Contacts.length" :key="index" class="bg-[#bcbfc5] even:bg-[#e5e7eb]">
            <td v-for="item in 8" :key="item" class="!h-28">
              <v-skeleton-loader type="text" color="transparent" class="">
              </v-skeleton-loader>
            </td>
            <td class="min-w-48">
              <div class="w-full px-8">
                <v-skeleton-loader type="button,button" color="transparent" class=" ">
                </v-skeleton-loader>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- <tbody v-if="localStorageCondition()" class="bg-[#dddbdb] text-[#212222] overflow-hidden">
          <tr v-for="(item, index) in state.contacts.LocalContacts" :key="index"
            class="text-right text-xl overflow-hidden even:bg-gray-200 bg-gray-400/50 cursor-pointer hover:bg-sky-900/60 hover:text-white duration-100 select-none"
            @dblclick="toggleEditForm(item)">
            <td>{{ index + 1 }}</td>
            <td>
              <v-avatar variant="elevated" class="!h-20 !w-20 my-2" :image="item.avatar" />
            </td>
            <td>{{ item.fullname }}</td>
            <td>{{ PersianNumberConvertorX(item.phoneNumber) }}</td>
            <td>
              {{
                PersianNumberConvertorX(moment(item.selectedDate).format("jYYYY/jMM/jDD"))
              }}
            </td>
            <td>{{ item.isCoworker ? "بله" : "خیر" }}</td>
            <td>{{ item.skills ? item.skills.join(" , ") : "" }}</td>
            <td>{{ item.favorites ? item.favorites.join(" , ") : "" }}</td>
            <td class="">
              <div class="actionButtonsContainer flex gap-2 items-center justify-center">
                <v-btn variant="elevated" elevation="2" prepend-icon="mdi-delete"
                  @click="DeleteLocalStorageContacts(item.id, state.contacts.LocalContacts)"
                  class="bg-red-600/90 hover:bg-red-600/95">
                  حذف
                </v-btn>
                <v-btn variant="elevated" color="blue" prepend-icon="mdi-account" @click="toggleEditForm(item)"
                  class="bg-sky-600/90 hover:bg-sky-600/95">
                  ویرایش
                </v-btn>
              </div>
            </td>
          </tr>
        </tbody> -->
        <!-- Locals -->
        <ContactRecord
          v-if="localStorageCondition()"
          :LocalContacts="state.contacts.LocalContacts"
          :DeleteLocalStorageContacts="DeleteLocalStorageContacts"
          :toggleEditForm="toggleEditForm"
         />

         <!-- Server -->
         <ContactRecord
          v-if="serverCondition()"
          :LocalContacts="state.contacts.server_1_Contacts"
          :DeleteLocalStorageContacts="deleteServerContact"
          :toggleEditForm="toggleEditForm"
         />
        <!-- <tbody v-if="serverCondition()" class="bg-[#dddbdb] text-[#212222] overflow-hidden">
          <tr v-for="(item, index) in state.contacts.server_1_Contacts" :key="index"
            class="text-right text-xl overflow-hidden even:bg-gray-200 bg-gray-400/50 cursor-pointer hover:bg-sky-900/60 hover:text-white duration-100 select-none"
            @dblclick="toggleEditForm(item)">
            <td>{{ index + 1 }}</td>
            <td>
              <v-avatar variant="elevated" class="!h-20 !w-20 my-2" :image="item.avatar" />
            </td>
            <td>{{ item.fullname }}</td>
            <td>{{ PersianNumberConvertorX(item.phoneNumber) }}</td>
            <td>
              {{
                PersianNumberConvertorX(moment(item.selectedDate).format("jYYYY/jMM/jDD"))
              }}
            </td>
            <td>{{ item.isCoworker ? "بله" : "خیر" }}</td>
            <td>{{ item.skills ? item.skills.join(" , ") : "" }}</td>
            <td>{{ item.favorites ? item.favorites.join(" , ") : "" }}</td>
            <td class="">
              <div class="actionButtonsContainer flex gap-2 items-center justify-center">
                <v-btn variant="elevated" elevation="2" prepend-icon="mdi-delete" @click="deleteServerContact(item.id)"
                  class="bg-red-600/90 hover:bg-red-600/95">
                  حذف
                </v-btn>
                <v-btn variant="elevated" color="blue" prepend-icon="mdi-account" @click="toggleEditForm(item)"
                  class="bg-sky-600/90 hover:bg-sky-600/95">
                  ویرایش
                </v-btn>
              </div>
            </td>
          </tr>
        </tbody> -->
      </v-table>
      <div
        class="flex flex-col py-20 xl:py-0 md:rounded-lg !rounded-2xl bg-white items-center justify-center min-h-[200px] text-center"
        :class="state.loading.preview ? 'animate__animated animate__fadeInUp  animate__delay-2s' : ''
          " v-if="noContactPreview">
        <img src="../../assets/no-data.jpg" alt="" class="w-[35rem]" />
        <p class="pb-10 text-3xl">
          {{ getEmojiNodata(state.contacts.contactsPreview) }}

           هیچ مخاطبی در
           {{
            savingModeData(state.contacts.contactsPreview)
          }}
          موجود نیست
        </p>
      </div>
    </div>

<!-- Card Of LocalContacts -->
    <div
      class="test_card mx-4 md:!mx-auto md:container w-full flex flex-row-reverse flex-wrap xl:hidden items-stretch justify-center gap-8 cursor-pointer"
      v-if="!state.loading.skeletonLoads.LocalContacts && state.contacts.contactsPreview == 'LocalStorage'">
      <Card v-model:dialogEditState="state.forms.edit" :currentItem="item" :MyLocalContacts="state.contacts.LocalContacts"
        :selectedContact="state.contacts.selectedContact" :all_forms_fields="item" v-for="(item, index) in state.contacts.LocalContacts"
        :deleteServerContact="deleteServerContact" :contactsPreview="state.contacts.contactsPreview" :key="index"
        class="!max-w-[50%] flex-1 flex-wrap" />
    </div>
    
    <div
      class="test_card mx-4 md:!mx-auto md:container w-full flex flex-row-reverse flex-wrap xl:hidden items-stretch justify-center gap-8 cursor-pointer"
      v-if="!state.loading.skeletonLoads.server_1_Contacts && state.contacts.contactsPreview == 'Server'">
      <Card
      v-for="(item, index) in users"
       v-model:dialogEditState="state.forms.edit" :currentItem="item" :MyLocalContacts="state.contacts.LocalContacts"
        :selectedContact="state.contacts.selectedContact" :all_forms_fields="item" 
        :deleteServerContact="deleteServerContact" :contactsPreview="state.contacts.contactsPreview" :key="index"
        class="!max-w-[50%] flex-1 flex-wrap" />
    </div>

<!-- main content for cards -->
   <!-- <div
      class="test_card mx-4 md:!mx-auto md:container w-full flex flex-row-reverse flex-wrap xl:hidden items-stretch justify-center gap-8 cursor-pointer"
      v-if="!state.loading.skeletonLoads.server_1_Contacts && state.contacts.contactsPreview == 'Server'">
      <Card v-model:dialogEditState="state.forms.edit" v-for="(item, index) in state.contacts.server_1_Contacts" :currentItem="item"
        :MyLocalContacts="state.contacts.LocalContacts" :selectedContact="state.contacts.selectedContact" :all_forms_fields="item"
        :currentID="state.contacts.selectedContact.id" :deleteServerContact="deleteServerContact" :key="index"
        class="!max-w-[50%] flex-1 flex-wrap" />
    </div>  -->

    <div
      class="skeletonLoaders xl:hidden flex flex-row-reverse flex-wrap items-stretch justify-center container mx-auto gap-8 rounded-lg"
      v-if="state.loading.skeletonLoads.LocalContacts">
      <v-skeleton-loader v-for="(item, index) in state.contacts.LocalContacts" :key="index" min-height="540" elevation="24"
        type="	image , text, paragraph , article  , button , button"
        class="bg-sky-500/60 rounded-lg border shadow-lg min-w-[47%] shadow-black skeletonLoaderCard">
      </v-skeleton-loader>
    </div>

    <div
      class="addNewContact w-full flex xl:!justify-end justify-center
       container mx-auto xl:!px-0 py-5 xs:px-10 xl:px-0
        animate__animated animate__slow animate__delay-3s animate__fadeInRight">
      <v-btn v-if="!state.loading.skeletonLoads.LocalContacts && !state.loading.skeletonLoads.server_1_Contacts"
       variant="elevated" elevation="3" color="green" size="large" @click="toggleRegisterForm">
        ثبت مخاطب
        <v-icon left> mdi-plus </v-icon>
      </v-btn>
<!-- 
      <v-btn v-if="byLocalStorage ? !state.loading.skeletonLoads.LocalContacts || state.contacts.LocalContacts.length <= 0
          : !state.loading.skeletonLoads.server_1_Contacts || users.length <= 0
      " variant="elevated" elevation="3" color="green" size="large" @click="toggleRegisterForm">
        ثبت مخاطب
        <v-icon left> mdi-plus </v-icon>
      </v-btn> -->
      <!-- <v-btn v-if="!state.loading.skeletonLoads.LocalContacts && !state.loading.skeletonLoads.server_1_Contacts">
        ثبت مخاطب
      </v-btn> -->
    </div>
    <div class="flex items-center !justify-center xl:!justify-end w-full bg-gray-500/20 mx-auto container lg:mx-0">
      <v-skeleton-loader v-if="
        state.loading.skeletonLoads.LocalContacts && state.contacts.LocalContacts.length > 0 && 
        state.contacts.contactsPreview == 'LocalStorage'"
         type="button" color="transparent" class="w-32">
      </v-skeleton-loader>
    </div>
    <!-- <v-navigation-drawer v-model="drawer" temporary class=" select-none fixed duration-[580ms] h-[100vh] left-0 top-0 bg-[#ebf1ef]"
      :width="500">
      <v-list-item class="bg-[#f2faf5] h-16  shadow-sm shadow-sky-600/20 ">
        <div class="headerDrawer    ">
          <div class="headerContainer flex items-center justify-between w-full ">
            <div class="closeDrawer text-[#19a44c] bg-[#9ad7b1] font-extrabold rounded-md cursor-pointer
               px-2 py-1 text-center text-sm select-none flex items-center justify-center text-lg"
              @click.stop="drawer = !drawer">
              <v-icon icon="mdi-close"></v-icon>

            </div>
            <div class="titleHeader">
              <h2 class="text-[#38ac67] text-lg font-semibold">تنظیمات کاربری</h2>
            </div>
          </div>
        </div>
      </v-list-item>

      <v-divider></v-divider>

      <div class="settingsImage mt-8 mb-10 flex items-center justify-center">
        <img src="@/assets/settingsDrawer.jpg" title="تنظیمات کاربری" class="w-[42%] rounded-lg shadow-sm shadow-black">
      </div>
      <div class="listSettings  py-8   flex flex-col gap-5 px-12">
        <div class="apperanceSettings ">
          <div class="settingsTitle text-right">
            <h3 class="text-xl font-semibold text-[#58b97f]"><span class="text-gray-600 select-none ">__ </span> ظاهر
              <span class=" select-none text-gray-600"> __</span>
            </h3>
          </div>
          <div class="apperanceSettingsList flex items-center justify-between  ">
            <div class="themeSettings flex items-center  justify-start gap-4 text-xl my-6">
              <span class="text-green-700 bg-green-300 px-[.9rem] text-2xl py-1 rounded-full select-none">?

                <v-tooltip activator="parent" location="top">انتخاب رنگ قالب</v-tooltip>
              </span>
              <span class="text-black font-semibold">انتخاب قالب :</span>
            </div>
            <div class="selectTheme">
              <v-select :items="themeItems" class="w-28 text-right " label="رنگ" bg-color="white" variant="outlined" />
            </div>
          </div>
          <div class="animationSettings flex items-ceneter justify-between ">
            <div class="themeSettings flex items-center  justify-start gap-4 text-xl my-6 ">
              <span class="text-green-700 bg-green-300 px-[.9rem] text-2xl py-1 rounded-full select-none">
                <v-tooltip activator="parent" location="top">
                  فعال کردن انیمیشن ها
                </v-tooltip>
                ?</span>
              <span class="text-black font-semibold">انیمیشن :</span>
            </div>
            <div class="animationSwitchButton flex justify-center items-center ">
              <v-switch color="success" ripple class=" flex switchBtn " />
            </div>
          </div>
        </div>
        <div class="contentSettings">
          <div class="settingsTitle text-right">
            <h3 class="text-xl text-[#58b97f] font-semibold"><span class="text-gray-600 select-none ">__ </span> نحوه
              ذخیره سازی
              مخاطبین <span class=" select-none text-gray-600"> __</span></h3>
          </div>
          <div class="storagesButtons flex flex-col gap-4 mt-5 ">
  
            <div class="webBroweser">
              <v-btn class="text-right w-full md:w-2/3 " size="x-large"
              :variant="state.contacts.contactsPreview == 'LocalStorage' ? 'elevated' : 'outlined'"
              :color="state.contacts.contactsPreview == 'LocalStorage'? 'green' : 'black'"
              @click.stop="changePreviewStatus('LocalStorage')" prepend-icon="mdi mdi-web">مرورگر
                <v-tooltip activator="parent" location="top">مخاطبین در مرورگر شما ذخیره میشود و تازمانی که شما ذخیره
                  ساز محلی را پاک نکنید مخاطبین باقی میمانند</v-tooltip>
              </v-btn>
            </div>
            <div class="server_1">
              <v-btn
                class="text-right w-full md:w-2/3 " size="x-large"
                :variant="state.contacts.contactsPreview == 'Server' ? 'elevated' : 'outlined'"
                 :color="state.contacts.contactsPreview == 'Server'? 'green' : 'black'"
                @click.stop="changePreviewStatus('Server')" prepend-icon="mdi mdi-server"> سرور
                <v-tooltip activator="parent" location="bottom">مخاطبین در سرور شماره یک ذخیره میشوند</v-tooltip>
              </v-btn>
            </div>
          </div>
        </div>
      </div>

    </v-navigation-drawer> -->

    <Drawer v-model="drawer" v-model:drawer="drawer" :contactsPreview="state.contacts.contactsPreview" 
      :changePreviewStatus="changePreviewStatus"
    />
    <v-main style="height: 250px">
      <div class="d-flex justify-center align-center h-100"></div>
    </v-main>
  </div>


  <Forms
    v-model:modelState="state.forms.register" title="ثبت مخاطب"
    :registerMode="true" :editMode="false" :getData="getData"
     :mainTableKey="state.mainTableKey"
    @update:mainTableKey="updateMainTableKey"
    :contactsPreview="state.contacts.contactsPreview"
    @update:users="updateUsers" />
  <!-- :getData="getData()" -->

  <Forms v-model:model-state="state.forms.edit" title="ویرایش مخاطب" :editMode="true" :currentID="state.contacts.selectedContact.id"
    :allFormsFields="state.contacts.selectedContact" :getData="getData"
     
     :contactsPreview="state.contacts.contactsPreview"
      :registerMode="false"
    @update:mainTableKey="updateMainTableKey" :fetchUsers="fetchUsers()" />

 
</template>

<style scoped>
.mainContent {
  background-image: url(../../assets/test.jpg);
  background-position: center;
}
</style>


