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
import draggable from "vuedraggable";
import moment from "moment-jalaali";
import Sortable from "sortablejs/modular/sortable.complete.esm.js";
const col_filter = ref(false);

const myArray = ref([
  { id: 1, name: "Hasan" },
  { id: 2, name: "Javad" },
  { id: 3, name: "Vahid" },
]);
const drag = ref(false);
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
  pagination:{
    limit_contacts_per_page:3,
    total_contacts:44,
    current_page:2
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
//   if (e.key === "Preview Status") {
//     state.contacts.contactsPreview = "LocalStorage";
//     localStorage.setItem("Preview Status", "LocalStorage");
//   }
// }

// window.addEventListener("storage", handleStorageChange);
const handlePreviewChange = (newVal) => {
  switch (newVal) {
    case "Server":
      state.contacts.contactsPreview = "Server";
      getData();
      break;
    case "LocalStorage":
      state.contacts.contactsPreview = "LocalStorage";
      getData();
      break;
    default:
      console.warn("Invalid selection:", newVal);
  }
};
onMounted(async () => {
  if (
    !localStorage.getItem("Preview Status") &&
    state.contacts.contactsPreview == ""
  ) {
    localStorage.setItem("Preview Status", "LocalStorage");
    state.contacts.contactsPreview = "LocalStorage";
  }

  if (state.contacts.storedPreviewStatus == "LocalStorage") {
    state.contacts.contactsPreview = "LocalStorage";
    localStorage.setItem("Preview Status", state.contacts.contactsPreview);
  } else if (state.contacts.storedPreviewStatus == "Server") {
    state.contacts.contactsPreview = "Server";
    localStorage.setItem("Preview Status", state.contacts.contactsPreview);
  } else {
    localStorage.setItem("Preview Status", "LocalStorage");
    state.contacts.contactsPreview = "LocalStorage";
  }
  getData();

  // await fetchUsers();
  await fetchContacts(state.pagination.current_page)
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
      // await fetchUsers();
      await fetchContacts(state.pagination.current_page)
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
    case "LocalStorage":
      return "در حالت مرورگر";
    case "Server":
      return "در حالت سرور";
    case "Database":
      return "در حالت دیتابیس";
    case "Cloud":
      return "در حالت ابر";
    default:
      return false;
  }
};

const showRegisterButton = (previewStatus) => {
  if (previewStatus) {
    return (
      isContact_on_current_mode(previewStatus) !== false
      // !state.loading.skeletonLoads.LocalContacts ||
      // (state.contacts.LocalContacts.length === 0 && !savingModeData("محل نامشخص"))
    );
  } else {
    return false;
  }
};

// Factory user maker

const userMaking = () => {
  const randomNames = [
    "علی رضایی",
    "سارا احمدی",
    "رضا نیکو",
    "نرگس محمدی",
    "امید کاظمی",
    "زهرا عباسی",
    "کیان شریفی",
    "یاسمین فرهادی",
  ];
  const randomNumbers = [
    "09121234567",
    "09351112233",
    "09905556677",
    "09032223344",
    "09147896543",
    "09378945612",
    "09223334455",
  ];
  const randomDates = [
    "1375/07/10",
    "1368/03/05",
    "1380/09/22",
    "1372/01/15",
    "1379/11/30",
    "1384/04/17",
  ];
  const randomAvatars = [
    "https://picsum.photos/150?random=1",
    "https://picsum.photos/150?random=2",
    "https://picsum.photos/150?random=3",
    "https://picsum.photos/150?random=4",
    "https://picsum.photos/150?random=5",
  ];
  const skillsList = [
    "Vue.js",
    "React",
    "Node.js",
    "CSS",
    "HTML",
    "JavaScript",
    "Python",
  ];
  const interestsList = [
    "موسیقی",
    "ورزش",
    "کدنویسی",
    "فیلم",
    "عکاسی",
    "طبیعت گردی",
  ];
  const contacts = Array.from({ length: 5 }, (_, index) => ({
    id: index + 1,
    phoneNumber:
      randomNumbers[Math.floor(Math.random() * randomNumbers.length)],
    fullname: randomNames[Math.floor(Math.random() * randomNames.length)],
    selectedDate: randomDates[Math.floor(Math.random() * randomDates.length)],
    isCoworker: Math.random() > 0.5,
    skills: skillsList
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 4) + 1),
    favorites: interestsList
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3) + 1),
    avatar: randomAvatars[Math.floor(Math.random() * randomAvatars.length)],
  }));
  localStorage.setItem("contacts", JSON.stringify(contacts));
  state.contacts.LocalContacts.splice(
    0,
    state.contacts.LocalContacts.length,
    ...contacts
  );
  // Call this function to generate and store the contacts
  getData();
};
const updateContactsPreview = (newPreview) => {
  state.contacts.contactsPreview = newPreview;
};

const animatedItems = ref(new Set());

const handleAnimationEnd = (item) => {
  animatedItems.value.add(item);
};


async function fetchContacts(page = 1) {
  const res = await fetch(`http://localhost:4000/users?_page=${page}&_limit=${state.pagination.limit_contacts_per_page}`);
  // const res = await fetch(`http://localhost:4000/users?_page=2&_limit=4`);
  const data = await res.json();

  // // Get the total count from headers and ensure it's a number
  // const total = res.headers.get('X-Total-Count');
  // state.pagination.total_contacts = Number(total);  // Fix here

  const total = res.headers.get('X-Total-Count');
state.pagination.total_contacts = total ? Number(total) : 0;


  state.contacts.server_1_Contacts = data;
  state.pagination.current_page = page;
}

const nextPage=()=> {
  if (state.pagination.current_page * state.pagination.limit_contacts_per_page < state.pagination.total_contacts) {
    fetchContacts(state.pagination.current_page + 1);
  }
}

const prevPage=()=> {
  if (state.pagination.current_page > 1) {
    fetchContacts(state.pagination.current_page - 1);
  }
}



</script>
<template>
  <div
    class="w-full h-[100vh] flex flex-col gap-8 items-center justify-center bg-black/30"
    v-if="!state.loading.loadingStatus"
  >
    <half-circle-spinner :size="100" color="green" />
    <h2 class="text-xl loading_text">... در حال بارگذاری</h2>
  </div>

  <div
    class="mx-auto mainContent h-full bg-cover"
    v-if="state.loading.loadingStatus"
  >
    <header class="titlePage overflow-hidden">
      <div class="titleText animate__animated animate__fadeInUp animate__slow">
        <h1
          class="text-center py-8 text-3xl text-white title_header font-semibold flex items-center justify-center gap-2"
        >
          <span
            class="mdi"
            :class="getTitleEmoji(state.contacts.contactsPreview)"
          ></span>
          دفترچه تلفن {{ savingModeData(state.contacts.contactsPreview) }}
        </h1>
        <!-- <div class="fixed top-0 right-0">
          <AnalogClock class="scale-[.35] bg-green-500   " />
        </div> -->
      </div>
    </header>

    <div class="container mx-auto rounded-lg">
      <div
        class="px-4 my-2 text-center lg:!text-left animate__animated animate__slow animate__fadeInLeft"
      >
        <div class="setting">
          <span
            class="cursor-pointer mdi mdi-cog text-3xl text-white hover:scale-[.9] inline-flex duration-700 ease-in-out hover:rotate-[180deg] origin-center"
            @click.stop="drawer = !drawer"
          />
        </div>
      </div>

      <v-table
        class="the_table hidden xl:block"
        :class="tableAnimationClass"
        :key="state.mainTableKey"
      >
        <thead class="relative bg-transparent">
          <v-btn class="bg-[#2c3e50]" size="large" @click="col_filter = true"
            >ترتیب ستون ها</v-btn
          >
          <tr
            class="text-right !bg-[#2c3e50] text-[#627080] text-white text-lg"
          >
            <th
              class="text-right"
              v-for="(item, index) in tableItems"
              :key="index"
            >
              {{ item }}
            </th>
          </tr>
        </thead>

        <!-- Skeleton of LocalStorage -->
        <tbody
          class="w-full"
          v-if="
            state.loading.skeletonLoads.LocalContacts &&
            state.contacts.contactsPreview == 'LocalStorage'
          "
        >
          <tr
            v-for="(item, index) in state.contacts.LocalContacts.length"
            :key="index"
            class="even:bg-[#e0c083]  bg-[#f8f1e5]"
          >
            <td v-for="item in 8" :key="item" class="!h-28">
              <v-skeleton-loader type="text" color="transparent" class="">
              </v-skeleton-loader>
            </td>
            <td class="min-w-48">
              <div class="w-full px-8">
                <v-skeleton-loader
                  type="button,button"
                  color="transparent"
                  class=" "
                >
                </v-skeleton-loader>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Skeleton of Server -->

        <tbody
          class="w-full"
          v-if="
            state.loading.skeletonLoads.LocalContacts &&
            state.contacts.contactsPreview == 'Server'
          "
        >
          >
          <tr
            v-for="(item, index) in state.contacts.server_1_Contacts.length"
            :key="index"
            class="bg-[#bcbfc5] even:bg-[#e5e7eb]"
          >
            <td v-for="item in 8" :key="item" class="!h-28">
              <v-skeleton-loader type="text" color="transparent" class="">
              </v-skeleton-loader>
            </td>
            <td class="min-w-48">
              <div class="w-full px-8">
                <v-skeleton-loader
                  type="button,button"
                  color="transparent"
                  class=" "
                >
                </v-skeleton-loader>
              </div>
            </td>
          </tr>
        </tbody>

        <ContactRecord
          :columnOrder="tableItems"
          v-if="localStorageCondition()"
          :data="state.contacts.LocalContacts"
          :DeleteContacts="DeleteContacts"
          :toggleEditForm="toggleEditForm"
          :getData="getData"
        />

        <!-- Server -->
        <ContactRecord
          :columnOrder="tableItems"
          v-if="serverCondition()"
          :data="state.contacts.server_1_Contacts"
          :DeleteContacts="deleteServerContact"
          :toggleEditForm="toggleEditForm"
          :getData="getData"
        />
      </v-table>
      <div
        class="flex flex-col py-20 xl:py-0 md:rounded-lg !rounded-2xl bg-white items-center justify-center min-h-[200px] text-center"
        :class="getNoContactAnimatedClass"
        v-if="noContactPreview"
      >
        <Vue3Lottie
          v-if="lottieAnimation"
          :animationData="lottieAnimation"
          :height="400"
          :width="400"
        />

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
      "
    >
      <Card
        v-model:dialogEditState="state.forms.edit"
        :currentItem="item"
        :MyLocalContacts="state.contacts.LocalContacts"
        :selectedContact="state.contacts.selectedContact"
        :all_forms_fields="item"
        v-for="(item, index) in state.contacts.LocalContacts"
        :deleteServerContact="deleteServerContact"
        :contactsPreview="state.contacts.contactsPreview"
        :key="index"
        class="!max-w-[50%] flex-1 flex-wrap"
      />
    </div>

    <div
      class="test_card mx-4 md:!mx-auto md:container w-full flex flex-row-reverse flex-wrap xl:hidden items-stretch justify-center gap-8 cursor-pointer"
      v-if="
        !state.loading.skeletonLoads.server_1_Contacts &&
        state.contacts.contactsPreview == 'Server'
      "
    >
      <Card
        v-for="(item, index) in state.contacts.server_1_Contacts"
        v-model:dialogEditState="state.forms.edit"
        :currentItem="item"
        :MyLocalContacts="state.contacts.LocalContacts"
        :selectedContact="state.contacts.selectedContact"
        :all_forms_fields="item"
        :deleteServerContact="deleteServerContact"
        :serverUpdate="UpdateDataServer"
        :contactsPreview="state.contacts.contactsPreview"
        :key="index"
        class="!max-w-[50%] flex-1 flex-wrap"
      />
    </div>

    <div
      class="skeletonLoaders xl:hidden flex flex-row-reverse flex-wrap items-stretch justify-center container mx-auto gap-8 rounded-lg"
      v-if="state.loading.skeletonLoads.LocalContacts"
    >
      <v-skeleton-loader
        v-for="(item, index) in state.contacts.LocalContacts"
        :key="index"
        min-height="540"
        elevation="24"
        type="	image , text, paragraph , article  , button , button"
        class="bg-sky-500/60 rounded-lg border shadow-lg min-w-[47%] shadow-black skeletonLoaderCard"
      >
      </v-skeleton-loader>
    </div>

    <div
      v-if="
        !state.loading.skeletonLoads.LocalContacts ||
        !state.loading.skeletonLoads.server_1_Contacts
      "
      class="addNewContact flex-wrap flex xl:!justify-end justify-center container mx-auto xl:!px-0 py-5 xs:px-10 animate__animated animate__slow animate__delay-1s animate__fadeInRight"
    >
      <!-- animate__animated animate__slow animate__delay-1s animate__fadeInRight -->
      <v-btn
        v-if="showRegisterButton(state.contacts.contactsPreview)"
        variant="elevated"
        elevation="3"
        size="large"
        @click="toggleRegisterForm"
        class="bg-[#295687] hover:bg-[#3a6ea5]"
      >
        ثبت مخاطب
        <v-icon left class="pl-3"> mdi-plus </v-icon>
      </v-btn>
      <v-btn
        v-if="
          showRegisterButton(state.contacts.contactsPreview) &&
          state.contacts.contactsPreview == 'LocalStorage'
        "
        variant="elevated"
        elevation="3"
        class="bg-[#cd9732] hover:bg-[#cfa353] ml-5"
        size="large"
        @click="userMaking"
      >
        مخاطبین تصادفی
        <v-icon left class="pl-3"> mdi-human-male-male </v-icon>
      </v-btn>
    </div>
    <div
      v-if="
        state.loading.skeletonLoads.LocalContacts &&
        state.contacts.LocalContacts.length
      "
      class="mt-5 animate__animated animate__slow animate__fadeInUp animate__delay-2s flex items-center !justify-center xl:!justify-end w-full bg-gray-500/20 mx-auto container lg:mx-0"
    >
      <v-skeleton-loader type="button" color="transparent" class="w-32">
      </v-skeleton-loader>
    </div>

    <Drawer
      v-model="drawer"
      v-model:drawer="drawer"
      :contactsPreview="state.contacts.contactsPreview"
      @changePreviewStatus="handlePreviewChange"
      :changePreviewStatus="changePreviewStatus"
    />
    <v-main style="height: 250px">
      <div class="d-flex justify-center align-center h-100"></div>
    </v-main>
  </div>

  <Forms
    v-model:modelState="state.forms.register"
    title="ثبت مخاطب"
    :registerMode="true"
    :editMode="false"
    :getData="getData"
    :mainTableKey="state.mainTableKey"
    @update:mainTableKey="updateMainTableKey"
    :contactsPreview="state.contacts.contactsPreview"
  />
  <!-- :getData="getData()" -->

  <Forms
    v-model:model-state="state.forms.edit"
    title="ویرایش مخاطب"
    :editMode="true"
    :currentID="state.contacts.selectedContact.id"
    :allFormsFields="state.contacts.selectedContact"
    :getData="getData"
    :contactsPreview="state.contacts.contactsPreview"
    :registerMode="false"
    @update:mainTableKey="updateMainTableKey"
  />

  <v-dialog v-model="col_filter" width="550" persistent class="column_order">
    <v-card title="ترتیب ستون ها" class="rounded-xl">
      <div class="columns flex flex-col gap-4 items-center justify-center">
        <draggable
          v-model="tableItems"
          item-key="id"
          tag="transition-group"
          class=""
        >
          <template #item="{ element, index }">
            <div
              v-if="true"
              :key="element"
              :style="{
                animationDelay: `${index * 0.3}s !important`,
              }"
              class="hover:!bg-[#4c749f] even:bg-[#f8f1e5] col w-[300px] rounded-lg cursor-move select-none py-2 bg-gray-500 odd:bg-gray-300 odd:!bg-[#e0c083] text-black"
              :class="{
                test_animate: !animatedItems.has(element),
              }"
              @animationend="handleAnimationEnd(element)"
            >
              {{ element }}
            </div>
          </template>
        </draggable>
      </div>
      <template v-slot:actions>
        <div class="w-full my-2">
          <v-btn
            class=" bg-[#295687] hover:bg-[#3a6ea5] px-9"
            text="تایید"
            @click="col_filter = false"
            :style="{
                animationDelay: `3s !important`,
              }"
              :class="{
                test_animate: !animatedItems.has(element),
              }"
              @animationend="handleAnimationEnd(element)"
          ></v-btn>
        </div>
      </template>
    </v-card>
  </v-dialog>

  <div>
    <ul>
      <li class="p-3 bg-green-500/50 border-2 flex items-center justify-center flex-col border-black" v-for="contact in state.contacts.server_1_Contacts" :key="contact.id">
      <div class="rounded-full bg-red-400  w-24 h-24 overflow-hidden">
        <img :src="contact.avatar" alt="Avatar" class="object-left" />
      </div>
        <span>{{ contact.fullname }} - {{ contact.phoneNumber }}</span><br>
        <span>{{ contact.skills.join(",") }}</span>
      </li>
    </ul>

    <div class="pagination">
      <!-- :disabled="state.pagination.current_page === 1" -->
      <v-btn @click="prevPage" :disabled="state.pagination.current_page === 1">Previous</v-btn>
      <span>Page {{ state.pagination.current_page }} of {{ Math.ceil(state.pagination.total_contacts / state.pagination.limit_contacts_per_page) }}</span>
<v-btn @click="nextPage" :disabled="state.pagination.current_page * state.pagination.limit_contacts_per_page >= state.pagination.total_contacts">Next</v-btn>
      <!-- :disabled="state.pagination.current_page * state.pagination.limit_contacts_per_page >= state.pagination.total_contacts" -->
      
    </div>
  </div>
</template>

<style scoped>
.mainContent {
  background-image: url(../../assets/images/backgrounds/localstorage/a.jpg);
  background-position: center;
  background-size: cover;
}
.title_header {
  filter: drop-shadow(2px 3px 4px #000);
}
.test_animate {
  animation: testAnimate 1s 1s ease-out forwards;
  opacity: 0;
}

@keyframes testAnimate {
  from {
    opacity: 0;
    transform: translateX(200px);
  }
  to {
    opacity: 1;
    transform: translateX(0px);
  }
}
</style>
