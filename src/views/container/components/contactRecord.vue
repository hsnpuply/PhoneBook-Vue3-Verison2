<script setup>
import { onMounted, reactive, ref, watch } from "vue";
import { convertNumbersToPersian as PersianNumberConvertorX } from "@/utilities/functions";
import moment from "moment-jalaali";
import draggable from "vuedraggable";

const props = defineProps({
  data: Array,
  DeleteContacts: Function,
  toggleEditForm: Function,
}); 
</script>
<template>
  <draggable v-model="props.data" tag="tbody" class="text-xl bg-[#dddbdb] text-[#212222] overflow-hidden cursor-grab">
    <template #item="{ element, index }">
      <tr
        class="text-right text-xl overflow-hidden even:bg-gray-200 bg-gray-400/50 cursor-pointer hover:bg-sky-900/60 hover:text-white duration-100 select-none">
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
              DeleteContacts(
                element.id,
                state.contacts.data
              )
              " class="bg-red-600/90 hover:bg-red-600/95">
              حذف
            </v-btn>
            <v-btn variant="elevated" color="blue" prepend-icon="mdi-account" @click="toggleEditForm(element)"
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
