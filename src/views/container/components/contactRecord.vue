<script setup>
import {reactive, ref,watch} from 'vue'
import {convertNumbersToPersian as PersianNumberConvertorX} from '@/utilities/functions'
import moment from "moment-jalaali";

const props = defineProps({
    LocalContacts:Array,
    server_1_Contacts:Array,
    DeleteLocalStorageContacts:Function,
    toggleEditForm:Function

})

const state=reactive({
    contacts:{
        LocalContacts:props.LocalContacts,
        server_1_Contacts:props.server_1_Contacts
    }
})

</script>
<template>
<tbody class="bg-[#dddbdb] text-[#212222] overflow-hidden">
          <tr
           v-for="(item, index) in state.contacts.LocalContacts" :key="index"
           @dblclick="props.toggleEditForm(item)"
            class=" 
             text-right text-xl overflow-hidden even:bg-gray-200 bg-gray-400/50 cursor-pointer hover:bg-sky-900/60 hover:text-white duration-100 select-none"
            
            >
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
                  @click="props.DeleteLocalStorageContacts(item.id, state.contacts.LocalContacts)"
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
        </tbody>
</template>
<style></style>