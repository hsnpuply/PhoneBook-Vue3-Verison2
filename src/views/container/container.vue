<script setup>
import Swal from "sweetalert2";
import { ref, reactive, onMounted, computed, watch } from "vue";
import Forms from "@/views/container/components/forms.vue";
import Card from "@/views/container/components/contact_card.vue";
import axios from "axios";
import { HalfCircleSpinner } from "epic-spinners";
import "animate.css";
import NoDataServerAnimation from "@/assets/NoDataServerAnimation.json";
import NoDataLocalAnimation from "@/assets/NoDataLocalAnimation.json";
import draggable from 'vuedraggable'
import moment from "moment-jalaali";

const myArray = ref([
  { id: 1, name: 'Hasan' },
  { id: 2, name: 'Javad' },
  { id: 3, name: 'Vahid' },
])
const drag = ref(false)
import {
  convertNumbersToPersian as PersianNumberConvertorX,
  deleteLocalstorageContact as DeleteContacts,
} from "../../utilities/functions";

import ContactRecord from "./components/contactRecord.vue";
import Drawer from "./components/drawer.vue";


const state = reactive({
  contacts: {
    LocalContacts: [],
    server_1_Contacts: [],
    contactsPreview: "",
    storedPreviewStatus: localStorage.getItem("Preview Status"),

    selectedContact: {},
  },
  forms: {
    register: false,
    edit: false,
  },
  loading: {
    preview: true,
    loadingStatus: false,
    animateClass: "",
    skeletonLoads: {
      LocalContacts: true,
      server_1_Contacts: true,
    },
  },
  mainTableKey: 0,
});






watch(state.contacts.contactsPreview, (newValue) => {
  alert(state.contacts.contactsPreview);
  alert("something changed in contacts Preview");

  switch (newValue) {
    case "LocalStorage":
      state.contacts.contactsPreview = "LocalStorage";
      localStorage.setItem("Preview Status", state.contacts.contactsPreview);
      break;
    case "Server":
      state.contacts.contactsPreview = "Server";
      localStorage.setItem("Preview Status", state.contacts.contactsPreview);
  }
});

// function handleStorageChange(e) {
//   if (e.key === 'Preview Status') {
//     state.contacts.contactsPreview = e.newValue;
//   }}

// window.addEventListener('storage', handleStorageChange);
onMounted(async () => {

  if (!localStorage.getItem("Preview Status")  && state.contacts.contactsPreview == '' ) {
    localStorage.setItem("Preview Status", "LocalStorage");
    state.contacts.contactsPreview = "LocalStorage";
  }

  if (state.contacts.storedPreviewStatus == "LocalStorage") {
    state.contacts.contactsPreview = "LocalStorage";
    localStorage.setItem("Preview Status", state.contacts.contactsPreview);
  } else if (state.contacts.storedPreviewStatus == "Server") {
    state.contacts.contactsPreview = "Server";
    localStorage.setItem("Preview Status", state.contacts.contactsPreview);
  }else{
    localStorage.setItem("Preview Status", "LocalStorage");
    state.contacts.contactsPreview = "LocalStorage";
  }
  getData();

  await fetchUsers();
  setTimeout(() => {
    state.loading.preview = false;
  }, 2400);

  setTimeout(() => {
    state.loading.loadingStatus = true;
  }, 2000);
  setTimeout(() => {
    state.loading.skeletonLoads.LocalContacts = false;
  }, 6000);
});

function updateMainTableKey(newValue) {
  state.mainTableKey = newValue;
}

const getData = async () => {
  const storedContacts = JSON.parse(localStorage.getItem("contacts")) || [];
  switch (state.contacts.contactsPreview) {
    case "LocalStorage":
      state.contacts.LocalContacts.splice(
        0,
        state.contacts.LocalContacts.length,
        ...storedContacts
      );
      break;

    case "Server":
      await fetchUsers();
      break;
  }
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
        state.contacts.server_1_Contacts =
          state.contacts.server_1_Contacts.filter(
            (contact) => contact.id !== id
          ); // Update the local list of users

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
    state.contacts.contactsPreview == "LocalStorage"
  ) {
    state.contacts.contactsPreview = "LocalStorage";
    return true;
  }
};

const serverCondition = () => {
  if (
    state.contacts.server_1_Contacts.length > 0 &&
    state.contacts.contactsPreview == "Server"
  ) {
    state.contacts.contactsPreview = "Server";
    return true;
  }
};

const drawer = ref(null);

const noContactPreview = computed(() => {
  if (
    state.contacts.LocalContacts.length === 0 &&
    state.contacts.contactsPreview == "LocalStorage"
  ) {
    return true;
  } else if (
    state.contacts.server_1_Contacts.length === 0 &&
    state.contacts.contactsPreview == "Server"
  ) {
    return true;
  }

  return false;
});

const getEmojiNodata = (contactsPreview) => {
  switch (contactsPreview) {
    case "LocalStorage":
      return "😲";
    case "Server":
      return "😨";
    case "Database":
      return "😎";
    case "Cloud":
      return "☁️";
    default:
      return "❓"; // حالت پیش‌فرض
  }
};

const savingModeData = (contactsPreview) => {
  switch (contactsPreview) {
    case "LocalStorage":
      return "مرورگر ";
    case "Server":
      return "سرور";
    case "Database":
      return "دیتابیس";
    case "Cloud":
      return "فضای ابری";
    default:
      return "محل نامشخص";
  }
};

const getTitleEmoji = (contactsPreview) => {
  switch (contactsPreview) {
    case "LocalStorage":
      return "mdi-web";
    case "Server":
      return "mdi-server";
    case "Database":
      return "mdi-database";
    case "Cloud":
      return "mid-cloud";
    default:
      return "mdi-question-mark";
  }
};

const changePreviewStatus = (status) => {
  state.contacts.contactsPreview = status;
  localStorage.setItem("Preview Status", status);
  getData();
};

const NoDataLottie = (contactPreview) => {
  switch (contactPreview) {
    case "Server":
      return NoDataServerAnimation;
    case "LocalStorage":
      return NoDataLocalAnimation;
    default:
      return null;
  }
};

const lottieAnimation = computed(() =>
  NoDataLottie(state.contacts.contactsPreview)
);

const tableItems = ref([
  "شماره",
  "پروفایل",
  "نام و نام خانوادگی",
  "شماره تلفن",
  "تاریخ تولد",
  "همکار",
  "مهارت ها",
  "علاقه مندی ها",
  "عملیات",
]);
const animationTriggered = ref(false);
const animationTriggered2 = ref(false);

const getNoContactAnimatedClass = computed(() => {
  if (state.contacts.LocalContacts.length === 0 && !animationTriggered.value) {
    animationTriggered.value = true;
    return "animate__animated animate__slow animate__fadeInUp";
  }
  return "";
});

const tableAnimationClass = computed(() => {
  if (state.contacts.LocalContacts.length === 0 && !animationTriggered2.value) {
    animationTriggered2.value = true;
    return "animate__animated animate__slow animate__fadeInUp";
  } else if (
    state.contacts.LocalContacts.length > 0 &&
    !animationTriggered2.value
  ) {
    animationTriggered2.value = true;
    return "tableHavingContact animate__animated animate__fadeInUp";
  }
  return "";
});

const isContact_on_current_mode = (contactsPreview) => {
  switch (contactsPreview) {
    case 'LocalStorage':
      return "در حالت مرورگر";
    case 'Server':
      return "در حالت سرور";
    case 'Database':
      return "در حالت دیتابیس";
    case 'Cloud':
      return "در حالت ابر";
    default:
      return false;
  }
};

const showRegisterButton = (previewStatus) => {
  if(previewStatus){
    return (
    isContact_on_current_mode(previewStatus) !== false
    // !state.loading.skeletonLoads.LocalContacts ||
    // (state.contacts.LocalContacts.length === 0 && !savingModeData("محل نامشخص"))
  ) 
  }else{
    return false
  }
}

// Factory user maker

const userMaking = ()=>{

//   const randomNames = ["علی رضایی", "سارا احمدی", "رضا نیکو", "نرگس محمدی", "امید کاظمی", "زهرا عباسی", "کیان شریفی", "یاسمین فرهادی"];
//   const randomNumbers = ["09121234567", "09351112233", "09905556677", "09032223344", "09147896543", "09378945612", "09223334455"];
//   const randomDates = ["1375/07/10", "1368/03/05", "1380/09/22", "1372/01/15", "1379/11/30", "1384/04/17"];
//   const randomAvatars = [
//   "https://picsum.photos/150?random=1",
//   "https://picsum.photos/150?random=2",
//   "https://picsum.photos/150?random=3",
//   "https://picsum.photos/150?random=4",
//   "https://picsum.photos/150?random=5",
// ];
//   const skillsList = ["Vue.js", "React", "Node.js", "CSS", "HTML", "JavaScript", "Python"];
//   const interestsList = ["موسیقی", "ورزش", "کدنویسی", "فیلم", "عکاسی", "طبیعت گردی"];

//   const contacts = Array.from({ length: 5 }, (_, index) => ({
//     id: index + 1,
//     phoneNumber: randomNumbers[Math.floor(Math.random() * randomNumbers.length)],
//     fullname: randomNames[Math.floor(Math.random() * randomNames.length)],
//     selectedDate: randomDates[Math.floor(Math.random() * randomDates.length)],
//     isCoworker: Math.random() > 0.5,
//     skills: skillsList.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 1),
//     favorites: interestsList.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1),
//     avatar: randomAvatars[Math.floor(Math.random() * randomAvatars.length)],
//   }));

//   localStorage.setItem("contacts", JSON.stringify(contacts));
//   state.contacts.LocalContacts.splice(0, state.contacts.LocalContacts.length, ...contacts);

// // Call this function to generate and store the contacts
// getData();
}
const updateContactsPreview = (newPreview) => {
  state.contacts.contactsPreview = newPreview;
};

</script>
<template>
  <div class="w-full h-[100vh] flex flex-col gap-8 items-center justify-center bg-black/30"
    v-if="!state.loading.loadingStatus">
    <half-circle-spinner :size="100" color="green" />
    <h2 class="text-xl">... در حال بارگذاری</h2>
  </div>

  <div class="mx-auto mainContent h-full bg-cover" v-if="state.loading.loadingStatus">
    <header class="titlePage overflow-hidden">
      <div class="titleText animate__animated animate__fadeInUp animate__slow">
        <h1 class="text-center py-8 text-3xl text-black font-semibold flex items-center justify-center gap-2">
          <span class="mdi" :class="getTitleEmoji(state.contacts.contactsPreview)"></span>
          دفترچه تلفن {{ savingModeData(state.contacts.contactsPreview) }}
        </h1>
        <!-- <div class="fixed top-0 right-0">
          <AnalogClock class="scale-[.35] bg-green-500   " />
        </div> -->
      </div>
    </header>

    <div class="container mx-auto rounded-lg">
      <div class="px-4 my-2 text-center lg:!text-left animate__animated animate__slow animate__fadeInLeft">
        <div class="setting">
          <span
            class="cursor-pointer mdi mdi-cog text-3xl text-black inline-flex duration-700 ease-in-out hover:rotate-[180deg] origin-center"
            @click.stop="drawer = !drawer" />
        </div>
      </div>

      <v-table class="the_table hidden xl:block" :class="tableAnimationClass" :key="state.mainTableKey">
        <thead class="relative">
          <tr class="text-right bg-[#f9fafc] text-[#627080] text-lg">
            <th class="text-right" v-for="(item, index) in tableItems" :key="index">
              {{ item }}
            </th>
          </tr>
        </thead>

        <!-- Skeleton of LocalStorage -->
        <tbody class="w-full" v-if="localStorageCondition() && !state.contacts.LocalContacts?.length">
          <tr v-for="(item, index) in state.contacts.LocalContacts.length" :key="index"
            class="bg-[#bcbfc5] even:bg-[#e5e7eb]">
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

        <tbody class="w-full" v-if="serverCondition() && state.contacts.server_1_Contacts.length == 0">
          <tr v-for="(item, index) in state.contacts.server_1_Contacts.length" :key="index"
            class="bg-[#bcbfc5] even:bg-[#e5e7eb]">
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


        <ContactRecord v-if="localStorageCondition()" :data="state.contacts.LocalContacts"
          :DeleteContacts="DeleteContacts" :toggleEditForm="toggleEditForm" />


        <!-- Server -->
        <ContactRecord v-if="serverCondition()" :data="state.contacts.server_1_Contacts"
          :DeleteContacts="deleteServerContact" :toggleEditForm="toggleEditForm" />
      </v-table>
      <div
        class="flex flex-col py-20 xl:py-0 md:rounded-lg !rounded-2xl bg-white items-center justify-center min-h-[200px] text-center"
        :class="getNoContactAnimatedClass" v-if="noContactPreview">
        <Vue3Lottie v-if="lottieAnimation" :animationData="lottieAnimation" :height="400" :width="400" />

        <p class="pb-10 text-3xl">
          {{ getEmojiNodata(state.contacts.contactsPreview) }}

          هیچ مخاطبی در
          {{ savingModeData(state.contacts.contactsPreview) }}
          موجود نیست
        </p>
      </div>
    </div>

    <!-- Card Of LocalContacts -->
    <div
      class="test_card mx-4 md:!mx-auto md:container w-full flex flex-row-reverse flex-wrap xl:hidden items-stretch justify-center gap-8 cursor-pointer"
      v-if="
        !state.loading.skeletonLoads.LocalContacts &&
        state.contacts.contactsPreview == 'LocalStorage'
      ">
      <Card v-model:dialogEditState="state.forms.edit" :currentItem="item"
        :MyLocalContacts="state.contacts.LocalContacts" :selectedContact="state.contacts.selectedContact"
        :all_forms_fields="item" v-for="(item, index) in state.contacts.LocalContacts"
        :deleteServerContact="deleteServerContact" :contactsPreview="state.contacts.contactsPreview" :key="index"
        class="!max-w-[50%] flex-1 flex-wrap" />
    </div>

    <div
      class="test_card mx-4 md:!mx-auto md:container w-full flex flex-row-reverse flex-wrap xl:hidden items-stretch justify-center gap-8 cursor-pointer"
      v-if="
        !state.loading.skeletonLoads.server_1_Contacts &&
        state.contacts.contactsPreview == 'Server'
      ">
      <Card v-for="(item, index) in state.contacts.server_1_Contacts" v-model:dialogEditState="state.forms.edit"
        :currentItem="item" :MyLocalContacts="state.contacts.LocalContacts"
        :selectedContact="state.contacts.selectedContact" :all_forms_fields="item"
        :deleteServerContact="deleteServerContact" :serverUpdate="UpdateDataServer"
        :contactsPreview="state.contacts.contactsPreview" :key="index" class="!max-w-[50%] flex-1 flex-wrap" />
    </div>

    <div
      class="skeletonLoaders xl:hidden flex flex-row-reverse flex-wrap items-stretch justify-center container mx-auto gap-8 rounded-lg"
      v-if="state.loading.skeletonLoads.LocalContacts">
      <v-skeleton-loader v-for="(item, index) in state.contacts.LocalContacts" :key="index" min-height="540"
        elevation="24" type="	image , text, paragraph , article  , button , button"
        class="bg-sky-500/60 rounded-lg border shadow-lg min-w-[47%] shadow-black skeletonLoaderCard">
      </v-skeleton-loader>
    </div>

    <div
      class="addNewContact w-full flex xl:!justify-end justify-center container mx-auto xl:!px-0 py-5 xs:px-10 xl:px-0 animate__animated animate__slow animate__delay-1s animate__fadeInRight">
      <!-- animate__animated animate__slow animate__delay-1s animate__fadeInRight -->
      <v-btn v-if="showRegisterButton(state.contacts.contactsPreview)"
        
         variant="elevated" elevation="3" color="green" size="large" @click="toggleRegisterForm">
        ثبت مخاطب
        <v-icon left> mdi-plus </v-icon>
      </v-btn>
      <v-btn v-if="showRegisterButton(state.contacts.contactsPreview)"
        
        variant="elevated" elevation="3" color="green" size="large" @click="userMaking">
       Randoms
       <v-icon left> mdi-plus </v-icon>
     </v-btn>

    </div>
    <div v-if="
      state.loading.skeletonLoads.LocalContacts &&
      state.contacts.LocalContacts.length
    "
      class="animate__animated animate__slow animate__fadeInUp animate__delay-2s flex items-center !justify-center xl:!justify-end w-full bg-gray-500/20 mx-auto container lg:mx-0">
      <v-skeleton-loader type="button" color="transparent" class="w-32">
      </v-skeleton-loader>
    </div>

    <Drawer v-model="drawer" v-model:drawer="drawer" :contactsPreview="state.contacts.contactsPreview"
    @changePreviewStatus="updateContactsPreview"

      :changePreviewStatus="changePreviewStatus" />
    <v-main style="height: 250px">
      <div class="d-flex justify-center align-center h-100"></div>
    </v-main>
  </div>

  <Forms v-model:modelState="state.forms.register" title="ثبت مخاطب" :registerMode="true" :editMode="false"
    :getData="getData" :mainTableKey="state.mainTableKey" @update:mainTableKey="updateMainTableKey"
    :contactsPreview="state.contacts.contactsPreview"  />
  <!-- :getData="getData()" -->

  <Forms v-model:model-state="state.forms.edit" title="ویرایش مخاطب" :editMode="true"
    :currentID="state.contacts.selectedContact.id" :allFormsFields="state.contacts.selectedContact" :getData="getData"
    :contactsPreview="state.contacts.contactsPreview" :registerMode="false" @update:mainTableKey="updateMainTableKey" />

  <p class="text-2xl p-5 bg-black ">Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa eaque ipsa, optio,
    eveniet assumenda tenetur eos dolor provident esse, sunt error quibusdam ex quidem fugit? Nisi expedita quasi
    officiis autem.</p>

  <draggable v-model="myArray" group="people" @start="drag = true" @end="drag = false" item-key="id">
    <template #item="{ element }">
      <div class="text-2xl text-center bg-green-500 my-2 p-4">{{ element.id }} : {{ element.name }}</div>
    </template>
  </draggable>
  <v-table>
    <tbody>
      <draggable v-model="state.contacts.LocalContacts" group="people" @start="drag = true" @end="drag = false"
        item-key="id">
        <template #item="{ element }">
          <tr class=" ">
            <td class="text-2xl text-center bg-green-500 my-2 p-4">
              {{ element.id }} : {{ element.fullname }}
            </td>
            <td>{{ index + 1 }}</td>
            <td>
              <v-avatar variant="elevated" class="!h-20 !w-20 my-2" :image="element.avatar" />
            </td>
            <td>{{ element.fullname }}</td>
            <td>{{ PersianNumberConvertorX(element.phoneNumber) }}</td>
            <td>
              {{
                PersianNumberConvertorX(moment(element.selectedDate).format("jYYYY/jMM/jDD"))
              }}
            </td>
            <td>{{ element.isCoworker ? "بله" : "خیر" }}</td>
            <td>{{ element.skills ? element.skills.join(" , ") : "" }}</td>
            <td>{{ element.favorites ? element.favorites.join(" , ") : "" }}</td>
            <td class="">
              <div class="actionButtonsContainer flex gap-2 items-center justify-center">
                <v-btn variant="elevated" elevation="2" prepend-icon="mdi-delete"
                  @click="props.DeleteContacts(element.id, state.contacts.LocalContacts)"
                  class="bg-red-600/90 hover:bg-red-600/95">
                  حذف
                </v-btn>
                <v-btn variant="elevated" color="blue" prepend-icon="mdi-account" @click="props.toggleEditForm(item)"
                  class="bg-sky-600/90 hover:bg-sky-600/95">
                  ویرایش
                </v-btn>
              </div>
            </td>
          </tr>
        </template>
      </draggable>
    </tbody>
  </v-table>


</template>

<style scoped>
.mainContent {
  background-image: url(../../assets/test.jpg);
  background-position: center;
}
</style>
