<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { convertNumbersToPersian as PersianNumberConvertorX } from "@/utilities/functions";
import moment from "moment-jalaali";
import draggable from "vuedraggable";
import Swal from "sweetalert2";

const props = defineProps({
  data: Array,
  DeleteContacts: Function,
  toggleEditForm: Function,
  getData: Function,
  columnOrder: Array,
  isPrint: Boolean,
});

const fieldsMapping = {
  شماره: "index",
  پروفایل: "avatar",
  "نام و نام خانوادگی": "fullname",
  "شماره تلفن": "phoneNumber",
  "تاریخ تولد": "selectedDate",
  همکار: "isCoworker",
  "مهارت ها": "skills",
  "علاقه مندی ها": "favorites",
  عملیات: "actions",
};
const emit = defineEmits(["update:data"]);

// Reactive list to track updates
const localData = ref([...props.data]);

watch(localData, (newValue) => {
  emit("update:data", newValue);
});

// Watch for changes in props.data (from parent)
watch(
  () => props.data,
  (newValue) => {
    localData.value = [...newValue];
  },
  { deep: true, immediate: true }
);

// Watch for reorder and emit changes to parent
watch(
  localData,
  (newValue) => {
    emit("update:data", newValue);
  },
  { deep: true }
);
const saveOrderLocal = () => {
  switch (localStorage.getItem("Preview Status")) {
    case "LocalStorage":
      localStorage.setItem("contacts", JSON.stringify(localData.value));
      break;
    case "Server":
      // console.log('lols');

      break;
  }
};

const is_expanded = ref(false);

// Reactive object to track expanded rows
const expandedRows = reactive({});

const toggle_expand = (id) => {
  expandedRows[id] = !expandedRows[id]; // Toggle expansion for the specific row
};
const formatPhoneNumber = (number) => {
  if (!number) return "";
  return number.replace(/(\d{4})(\d{3})(\d{4})/, "$1-$2-$3");
};
const copyToClipboard = (number) => {
  navigator.clipboard.writeText(number);

  Swal.fire({
    icon: "success",
    title: "کپی شد",
    width: "200px",
    toast: true,
    position: "top", // Top-right corner
    showConfirmButton: false,
    timer: 1000,
    color: "green",
    background: "#fff",
    timerProgressBar: true,
  });
};
const getSkillStyle = (skill) => {
  const styles = {
    "Vue.js": "bg-gradient-to-r from-green-400 to-emerald-600 text-white",
    React: "bg-gradient-to-r from-blue-400 to-indigo-600 text-white",
    "Node.js": "bg-gradient-to-r from-green-600 to-lime-500 text-white",
    CSS: "bg-gradient-to-r from-purple-400 to-pink-500 text-white",
    HTML: "bg-gradient-to-r from-orange-400 to-red-500 text-white",
    JavaScript: "bg-gradient-to-r from-yellow-300 to-amber-500 text-white",
    Python:
      "bg-gradient-to-r from-blue-500 via-blue-400 to-yellow-400 text-white", // 3-color gradient for Python
  };
  return (
    styles[skill] || "bg-gradient-to-r from-gray-400 to-gray-600 text-white"
  ); // Default gradient
};
</script>
<template>
  <draggable
    v-model="localData"
    group="allContacts"
    @end="saveOrderLocal"
    tag="tbody"
    :class="{ '': props.isPrint }"
    class="select-none text-xl bg-[#dddbdb] text-[#333333] cursor-grab"
  >
    <template #item="{ element, index }">
      <tr
        :class="expandedRows[element.id]  ? '!h-[200px] ' : ''"
        class="row_records group tr_contact_record relative ease-in-out overflow-hidden h-[100px] text-right hover:!bg-[#4c749f] hover:text-white duration-150 even:bg-gray-200 even:!bg-[#e0c083] bg-gray-400/50 !bg-[#f8f1e5] hover:bg-sky-900/60"
      >
        <td v-for="(col, i) in columnOrder" :key="i"  :class="props.isPrint ?  'border-[3px] border-solid border-black' : ''">
          <template v-if="fieldsMapping[col] === 'index'">
            <span class="px-2 ">{{ PersianNumberConvertorX(`${index + 1}`) }}</span>
          </template>
          <template v-else-if="fieldsMapping[col] === 'fullname'">
          <div class="text-center"
          :class="{'px-4' : props.isPrint}"
          >
            <span class="print:text-sm w-full"> {{ element.fullname }}</span>
          </div>
          </template>
          <template v-else-if="fieldsMapping[col] === 'avatar'">
            <div class="" :class="{ 'px-2 flex items-center justify-center' : props.isPrint}">
              <v-avatar
              variant="elevated"
              class="avatar_img !h-20 !w-20 my-2"
              :image="element.avatar"
            />
            </div>
          </template>
          <template v-else-if="fieldsMapping[col] === 'selectedDate'">
          <div class="" :class="{ 'px-2 text-center' : props.isPrint}">
            <span class="print:text-base">
              {{
                PersianNumberConvertorX(
                  moment(element.selectedDate).format("jYYYY/jMM/jDD")
                )
              }}
            </span>
          </div>

          </template>
          <template v-else-if="fieldsMapping[col] === 'phoneNumber'">
          <div class="" :class="{'px-3' : props.isPrint}" >
            <span
              class="print:text-base phone_number cursor-pointer hover:underline"
              @click="copyToClipboard(element.phoneNumber)"
            >
              {{
                PersianNumberConvertorX(formatPhoneNumber(element.phoneNumber))
              }}
            </span>
          
          </div>
          </template>
          <template v-else-if="fieldsMapping[col] === 'isCoworker'">
            <div v-if="!props.isPrint" class="flex items-center justify-center">
              <v-icon
              v-if="element.isCoworker && !props.isPrint"
              icon="mdi-check"
              color="green"
              class="print:hidden text-4xl"
            ></v-icon>
            <v-icon
              v-else-if="!element.isCoworker && !props.isPrint"
              icon="mdi-close-thick"
              class="text-red-500 group-hover:!text-red-600 print:hidden"
            ></v-icon>
            </div>
            <div class=" text-center" 
            :class="{'px-8' : props.isPrint}"
            >
              <span v-if="props.isPrint"  class="text-center w-full ">{{
              element.isCoworker ? "بله" : "خیر"
            }}</span>
            </div>

          </template>
          <template v-else-if="fieldsMapping[col] === 'skills'">
            <div
              class="max-w-20   overflow-hidden"
              :class="[
                expandedRows[element.id] && !props.isPrint
                  ? 'max-w-28 skills_container transition-[max-height] ease-in-out !max-h-[300px] !duration-500'
                  : '' ,
                  !props.isPrint ? ' max-h-12 ' : 'flex max-w-full flex-col py-4 gap-4 px-4 '
                  ]
              "
            >
              <p
                :class="[!props.isPrint ? getSkillStyle(item)  : ''
                  ,  !props.isPrint ? 'skills_badge shadow-black/50 shadow-sm rounded-full p-2 my-2'
                   : '!text-lg' ,
                ]"
                class=" text-sm text-center"
                v-for="(item, index) in element.skills"
                :key="index"
              >
                {{ item }}
              </p>
            </div>
          </template>
          <template v-else-if="fieldsMapping[col] === 'favorites'">
            <div
              class="max-w-20   w-full "
              :class="
              [
                expandedRows[element.id] && !props.isPrint
                  ? ' favs_container flex gap-2 flex-col overflow-hidden max-w-28 transition-[max-height] ease-in-out !max-h-[300px] !duration-500'
                  : '',
                  !props.isPrint ? 'max-h-12' : 'bg-blue-500  flex gap-4 flex-col py-4 px-4 text-center'

                  ]
              "
            >
              <span
                class="favs_badge print:text-sm text-lg p-1 text-center"
                v-for="(item, index) in element.favorites"
                :key="index"
              >
                {{ item + " " }}
              </span>
            </div>
          </template>
          <template v-else-if="fieldsMapping[col] === 'actions'">
            <div
              v-if="!props.isPrint"
              class="actionButtonsContainer no-print flex gap-16 items-center justify-center"
            >
              <v-icon color="black" @click="props.toggleEditForm(element)"
                >mdi-pencil</v-icon
              >
              <v-icon
                color="red"
                class="  "
                @click="props.DeleteContacts(element.id, props.data)"
                >mdi-delete</v-icon
              >
            </div>
          </template>
          <template v-else>
            {{
              Array.isArray(element[fieldsMapping[col]])
                ? element[fieldsMapping[col]].join(", ")
                : element[fieldsMapping[col]]
            }}
          </template>
        </td>

        <!-- Display the expand toggle button only if the 'skills' array has more than 2 items -->
        <div
          v-if="element.skills && element.skills.length > 2 && !props.isPrint"
          class="expand_toggle no-print py-2 absolute -bottom-6 right-[45%]"
          @click="toggle_expand(element.id)"
        >
          <v-btn
            icon="mdi-arrow-down"
            :class="expandedRows[element.id] ? 'rotate-180' : ''"
          >
          </v-btn>
        </div>
      </tr>
    </template>
  </draggable>
</template>
<style></style>
