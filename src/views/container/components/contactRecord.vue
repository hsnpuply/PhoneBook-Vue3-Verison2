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
</script>
<template>

  <draggable v-model="localData" group="allContacts" 
  @end="saveOrderLocal"
  tag="tbody"
   class="select-none text-xl bg-[#dddbdb] text-[#212222] cursor-grab">
    <template #item="{ element, index }">
      <tr class="text-right even:bg-gray-200 bg-gray-400/50 hover:bg-sky-900/60">
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
          <template v-else>
            {{ Array.isArray(element[fieldsMapping[col]]) ? element[fieldsMapping[col]].join(", ") : element[fieldsMapping[col]] }}
          </template>
        </td>
      </tr>
    </template>
  </draggable>
</template>
<style></style>
