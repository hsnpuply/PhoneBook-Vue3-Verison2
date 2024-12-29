<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { convertNumbersToPersian as PersianNumberConvertorX } from "@/utilities/functions";
import moment from "moment-jalaali";
import draggable from "vuedraggable";

const props = defineProps({
  data: Array,
  DeleteContacts: Function,
  toggleEditForm: Function,
  getData:Function
}); 
const emit = defineEmits(['update:data']);


// Reactive list to track updates
const localData = ref([...props.data]);

// Sync props.data if it changes externally
const computedData = computed({
  get: () => localData.value,
  set: (newValue) => {
    localData.value = newValue;
    emit('update:data', newValue);
    props.getData
  }
});

// Watch and update parent directly if needed
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

</script>
<template>
  <draggable 
  v-model="computedData"
  group="allContacts"
   tag="tbody" class="text-xl bg-[#dddbdb] text-[#212222] overflow-hidden cursor-grab">
    <template #item="{ element, index }">
      <tr
        class="text-right text-xl overflow-hidden
         even:bg-gray-200 bg-gray-400/50 cursor-pointer
          hover:bg-sky-900/60 hover:text-white duration-100 select-none">
        <td>{{ index + 1 }}</td>
        <td>
          <v-avatar variant="elevated" class="!h-20 !w-20 my-2" :image="element.avatar" />
        </td>
        <td>{{ element.fullname }}</td>
        <td>{{ PersianNumberConvertorX(element.phoneNumber) }}</td>
        <td>
          {{
            PersianNumberConvertorX(
              moment(element.selectedDate).format("jYYYY/jMM/jDD")
            )
          }}
        </td>
        <td>{{ element.isCoworker ? "بله" : "خیر" }}</td>
        <td>{{ element.skills ? element.skills.join(" , ") : "" }}</td>
        <td>{{ element.favorites ? element.favorites.join(" , ") : "" }}</td>
        <td class="">
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
        </td>
      </tr>
    </template>
  </draggable>
</template>
<style></style>
