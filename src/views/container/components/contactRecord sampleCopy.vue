<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { convertNumbersToPersian as PersianNumberConvertorX } from "@/utilities/functions";
import moment from "moment-jalaali";
import draggable from "vuedraggable";

const props = defineProps({
  data: Array,
  DeleteContacts: Function,
  toggleEditForm: Function,
  getData:Function,
  columnOrder: Array,

}); 

const fieldsMapping = {
  "شماره": "index",
  "پروفایل": "avatar",
  "نام و نام خانوادگی": "fullname",
  "شماره تلفن": "phoneNumber",
  "تاریخ تولد": "selectedDate",
  "همکار": "isCoworker",
  "مهارت ها": "skills",
  "علاقه مندی ها": "favorites",
  "عملیات": "actions"
};
const emit = defineEmits(['update:data']);


// Reactive list to track updates
const localData = ref([...props.data]);

watch(localData, (newValue) => {
  emit('update:data', newValue);

});

// Watch for changes in props.data (from parent)
watch(() => props.data, (newValue) => {
  localData.value = [...newValue];
}, { deep: true, immediate: true });

// Watch for reorder and emit changes to parent
watch(localData, (newValue) => {
  emit('update:data', newValue);
}, { deep: true });
const saveOrderLocal = ()=>{
  switch(localStorage.getItem("Preview Status")){
    case 'LocalStorage':
    localStorage.setItem("contacts", JSON.stringify(localData.value));
    break;
    case 'Server':
      console.log('lols');
      
      break;
    
  }
}
const showFullSkills = ref([]);
const showFullFavorites = ref([]);

// Toggle expanding/collapsing skill lists
const toggleExpand = (index) => {
  const idx = showFullSkills.value.indexOf(index);
  if (idx === -1) {
    showFullSkills.value.push(index);
  } else {
    showFullSkills.value.splice(idx, 1);
  }
};
</script>
<template>

  <draggable v-model="localData" group="allContacts" 
  @end="saveOrderLocal"
  tag="tbody"
   class="select-none text-xl  bg-[#dddbdb] text-[#333333] cursor-grab">
    <template #item="{ element, index }">
      <tr class="text-right hover:!bg-[#4c749f] hover:text-white duration-150  even:bg-gray-200 even:!bg-[#e0c083] bg-gray-400/50 !bg-[#f8f1e5] hover:bg-sky-900/60">
        <td v-for="(col, i) in columnOrder" :key="i">
          <template v-if="fieldsMapping[col] === 'index'">
            {{ index + 1 }}
          </template>
          <template v-else-if="fieldsMapping[col] === 'avatar'">
            <v-avatar variant="elevated" class="!h-20 !w-20 my-2" :image="element.avatar" />
          </template>
          <template v-else-if="fieldsMapping[col] === 'selectedDate'">
            {{
              PersianNumberConvertorX(moment(element.selectedDate).format("jYYYY/jMM/jDD"))
            }}
          </template>
          <template v-else-if="fieldsMapping[col] === 'isCoworker'">
            {{ element.isCoworker ? "بله" : "خیر" }}
          </template>
          <template v-else-if="fieldsMapping[col] === 'actions'">
            <div class="actionButtonsContainer flex gap-2 items-center justify-center">
            <v-btn variant="elevated" elevation="2" prepend-icon="mdi-delete" @click="
              props.DeleteContacts(
                element.id,
                props.data
              )
              " class="bg-red-600/90 hover:bg-red-600/95">
              حذف
            </v-btn>
            <v-btn variant="elevated" color="blue" prepend-icon="mdi-account" @click="props.toggleEditForm(element)"
              class="bg-sky-600/90 hover:bg-sky-600/95">
              ویرایش
            </v-btn>
          </div>
          </template>
            <template v-else-if="fieldsMapping[col] === 'skills'">
            <div>
              <p v-if="!showFullSkills.includes(index)" class="text-center my-2">
                {{ element.skills.slice(0, 2).join(", ") }}
                <p v-if="element.skills.length > 2" 
                  @click="toggleExpand(index)" 
                  class="text-black cursor-pointer my-2">
                  <v-btn icon="mdi mdi-arrow-down-drop-circle" class="text-lg" size="22px"  variant="text"></v-btn>
                </p>
              </p>
              
              <p v-else class="mt-4 text-center group">
                {{ element.skills.join(", ") }}
                <p @click="toggleExpand(index)" 
                  class="text-black cursor-pointer my-3 mb-4  text-center">
                  <v-btn icon="mdi mdi-arrow-up-drop-circle " 
                   class="  text-lg opacity-0   group-hover:text-center group-hover:!opacity-[1]" size="22px"  variant="text"></v-btn>
                </p>
              </p>
            </div>
          </template>

           <!-- Favorites (Expandable) -->
           <template v-else-if="fieldsMapping[col] === 'favorites'">
            <div>
              <transition name="expand" mode="out-in">
                <div v-if="showFullFavorites.includes(index)">
                  {{ element.favorites.join(", ") }}
                  <span @click="toggleExpand(index, 'favorites')" 
                    class="text-red-500 cursor-pointer">
                    بستن
                  </span>
                </div>
                <div v-else>
                  {{ element.favorites.slice(0, 2).join(", ") }}
                  <span v-if="element.favorites.length > 2" 
                    @click="toggleExpand(index, 'favorites')" 
                    class="text-blue-500 cursor-pointer">
                    ... بیشتر
                  </span>
                </div>
              </transition>
            </div>
          </template>

          <template v-else>
            {{ Array.isArray(element[fieldsMapping[col]]) ? element[fieldsMapping[col]].join(", ") : element[fieldsMapping[col]] }}
          </template>
        </td>
      </tr>
    </template>
  </draggable>
</template>
<style>
.expand-enter-active, .expand-leave-active {
  transition: all 0.3s ease;
  max-height: 200px;
  overflow: hidden;
}
.expand-enter-from, .expand-leave-to {
  max-height: 0;
  opacity: 0;
}
.expand-enter-to, .expand-leave-from {
  max-height: 200px;
  opacity: 1;
}
</style>
