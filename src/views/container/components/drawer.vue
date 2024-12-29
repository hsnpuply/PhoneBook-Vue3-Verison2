<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
const props = defineProps({
  drawer: Boolean,
  contactsPreview: String,
  server_1_Contacts: Array,
  localContacts: Array
})


const state = reactive({
  contacts: {
    contactsPreview: props.contactsPreview,
    data_saving_mode:[
      { Mode : 'LocalStorage',Label:'مرورگر'},
      { Mode : 'Server',Label:'سرور'},
    ]
  },
  toggle: {
    drawer: props.drawer,
    guide_activation:false
  }
})

const emit = defineEmits([
  "update:drawer","changePreviewStatus"

]);



const toggleDrawer = () => {
  state.toggle.drawer = false
  emit("update:drawer", state.toggle.drawer);
}


watch(() => state.contacts.contactsPreview, (newVal) => {
  emit("changePreviewStatus", newVal);
  localStorage.setItem("Preview Status",newVal)
  alert(newVal)
  
})


const themeItems = ref(['آبی', 'سبز', 'زرد', 'بنفش'])
const NumberItems = ref([10, 25, 30, 35])

const PickedTheme = ref('')
const pagePerList = ref(10)


const themeChanger = (item) => {
  switch (item) {
    case 'سبز':
      return 'bg-gradient-to-t from-[#ebf1ef] to-[#a8e6cf]';
    case 'آبی':
      return 'bg-gradient-to-t from-[#ebf0f1] to-[#87ceeb]';
    case 'بنفش':
      return 'bg-gradient-to-t from-[#edebf1] to-[#e1abf7]';
    case 'زرد':
      return 'bg-gradient-to-t from-[#fcfbfa] to-[#f7da63]'; 
  }
};
onMounted(()=>{
  if(!localStorage.getItem("Guide_Activation")){
    localStorage.setItem("Guide_Activation", true);
    state.toggle.guide_activation = true
  }else{
    localStorage.getItem("Guide_Activation") == 'true' ? state.toggle.guide_activation = true : (state.toggle.guide_activation = false , localStorage.setItem("Guide_Activation",false))
  }


  if(!localStorage.getItem("Theme Color")){
    localStorage.setItem("Theme Color", 'سبز')
    PickedTheme.value = 'سبز'
   }else {
    const storedTheme = localStorage.getItem("Theme Color");
    if (themeItems.value.includes(storedTheme)) {
      PickedTheme.value = storedTheme;
    } else {
      localStorage.setItem("Theme Color", 'سبز');
      PickedTheme.value = 'سبز';
    }
  }
  })

watch(PickedTheme,(newVal)=>{
  localStorage.setItem("Theme Color", newVal)
})
const syncSettings = (event) => {
  if (event.key === "Theme Color") {
    const newTheme = event.newValue;
    if (themeItems.value.includes(newTheme)) {
      PickedTheme.value = newTheme;
    }
  }
  if(event.key === "Guide_Activation"){
    state.toggle.guide_activation = event.newValue === 'true' 
    ? true 
    : (console.log('Invalid value detected. Resetting to false.'), false);
    }

};
window.addEventListener('storage', syncSettings);


watch(()=> state.toggle.guide_activation,(newValue)=>{
  localStorage.setItem("Guide_Activation",newValue)
  state.toggle.guide_activation = newValue
})
const toggleGuideActivation= ()=>{
  state.toggle.guide_activation = !state.toggle.guide_activation
  localStorage.setItem("Guide_Activation",state.toggle.guide_activation)
}



</script>
<template>
  <v-navigation-drawer v-model="props.drawer" temporary
    class="h-[100vh]  bg-drawer_primary select-none fixed duration-[580ms] h-[100vh] left-0 top-0 " :width="500"
    :class="themeChanger(PickedTheme) || 'bg-gradient-to-t from-[#ebf1ef] to-[#a8e6cf]'">
    <div class="navigation w-full  ">
      <v-list-item class="bg-[#f2faf5] h-[3.5rem]  shadow-sm shadow-sky-600/20 ">
        <div class="headerDrawer    ">
          <div class="headerContainer flex items-center justify-between w-full ">
            <div class="closeDrawer text-[#19a44c] bg-[#9ad7b1] font-extrabold rounded-md cursor-pointer
               px-2 py-1 text-center text-sm select-none flex items-center justify-center text-lg"
              @click.stop="toggleDrawer">
              <v-icon icon="mdi-close"></v-icon>

            </div>
            <div class="titleHeader">
              <h2 class="text-[#38ac67] text-lg font-semibold">تنظیمات کاربری</h2>
            </div>
          </div>
        </div>
      </v-list-item>

      <v-divider></v-divider>

      <div class="settingsImage mt-4 mb-6 flex items-center justify-center">
        <img src="@/assets/settingsDrawer.jpg" title="تنظیمات کاربری"
          class="w-[9rem] rounded-lg shadow-sm shadow-black">
      </div>
      <div class="listSettings  pb-2   flex flex-col gap-2 px-12">
        <div class="apperanceSettings ">
          <div class="settingsTitle text-right">
            <h3 class="text-xl font-semibold text-[#58b97f]"><span class="text-gray-600 select-none pl-2 "> __ </span>
              ظاهر
              <span class=" select-none text-gray-600 pr-2"> __</span>
            </h3>
          </div>
          <div class="apperanceSettingsList flex items-center justify-between  ">
            <div class="themeSettings flex items-center  justify-start gap-4 text-lg my-2">
              <span class="text-green-700 bg-green-300 px-[.9rem] text-lg py-1 rounded-full select-none"
                v-if="state.toggle.guide_activation">?

                <v-tooltip activator="parent" class="" location="top">انتخاب رنگ قالب</v-tooltip>
              </span>
              <span class="text-black font-semibold text-base lg:text-lg">انتخاب قالب :</span>
            </div>
            <div class="selectTheme">
              <v-select
               hide-details
                :items="themeItems"
                v-model="PickedTheme"
                class="colorSelector w-26 scale-[.95]"
                bg-color="white" variant="outlined" />
            </div>
          </div>
          <div class="animationSettings flex items-ceneter justify-between ">
            <div class="themeSettings flex items-center  justify-start gap-4 text-xl my-6 ">
              <span v-if="state.toggle.guide_activation"
                class="text-green-700 bg-green-300 px-[.9rem] text-lg py-1 rounded-full select-none">
                <v-tooltip activator="parent" location="top">
                  فعال کردن انیمیشن ها
                </v-tooltip>
                ?</span>
              <span class="text-black font-semibold text-base lg:text-lg">انیمیشن :</span>
            </div>
            <div class="animationSwitchButton flex justify-center items-center ">
              <v-switch color="success" ripple class=" flex switchBtn " />
            </div>
          </div>
        </div>

        <div class="contentSettings">
          <div class="settingsTitle text-right">
            <h3 class="text-xl text-[#58b97f] font-semibold"><span class="text-gray-600 select-none pl-2">__ </span>
              محتوا
              <span class=" select-none text-gray-600 pr-2"> __</span>
            </h3>
          </div>

          <!-- ! -->
          <div class="apperanceSettingsList flex items-center justify-between  ">
            <div class="themeSettings flex items-center  justify-start gap-4 text-lg my-2">
              <span class="text-green-700 bg-green-300 px-[.9rem] text-lg py-1 rounded-full select-none"
                v-if="state.toggle.guide_activation">?

                <v-tooltip activator="parent" class="" location="top">تعداد لیست هر صفحه</v-tooltip>
              </span>
              <span class="text-black font-semibold text-base ">تعداد لیست هر صفحه :</span>
            </div>
            <div class="selectTheme">
              <v-select :items="NumberItems" v-model="pagePerList" class="colorSelector w-26 scale-[.95]"
                bg-color="white" variant="outlined" hide-details />
            </div>
          </div>
          <div class="animationSettings flex items-ceneter justify-between ">
            <div class="themeSettings flex items-center  justify-start gap-4 text-xl my-6 ">
              <span v-if="state.toggle.guide_activation"
                class="text-green-700 bg-green-300 px-[.9rem] text-lg py-1 rounded-full select-none">
                <v-tooltip activator="parent" location="top">
                  نمایش راهنما
                </v-tooltip>
                ?</span>
              <span class="text-black font-semibold text-base lg:text-lg"> نمایش راهنما
                :</span>
            </div>
            <div class="animationSwitchButton flex justify-center items-center ">
              <v-switch v-model="state.toggle.guide_activation" @click="toggleGuideActivation()" color="success" ripple
                class=" flex switchBtn " />
            </div>
          </div>
        </div>


        <div class="contentSettings">
          <div class="settingsTitle text-right">
            <h3 class="text-xl text-[#58b97f] font-semibold"><span class="text-gray-600 select-none pl-2">__ </span>
              محتوا
              <span class=" select-none text-gray-600 pr-2"> __</span>
            </h3>
          </div>

          <!-- ! -->
          <div class="apperanceSettingsList flex items-center justify-between  ">
            <div class="themeSettings flex items-center  justify-start gap-4 text-lg my-2">
              <span class="text-green-700 bg-green-300 px-[.9rem] text-lg py-1 rounded-full select-none"
                v-if="state.toggle.guide_activation">?

                <v-tooltip activator="parent" class="" location="top">نحوه نمایش مخاطبین</v-tooltip>
              </span>
              <span class="text-black font-semibold text-base ">نحوه ذخیره سازی :</span>
            </div>
            <div class="selectTheme">
              <v-select 
              :items="state.contacts.data_saving_mode"
               v-model="state.contacts.contactsPreview"
                bg-color="white" variant="outlined"
                class="colorSelector w-26 scale-[.95]" 
                 hide-details
                item-title="Label" item-value="Mode" 
                />
            </div>
          </div>

        </div>




        <div class="generalSettings">
          <div class="settingsTitle text-right">
            <h3 class="text-lg  text-[#58b97f] font-semibold"><span class="text-gray-600 select-none pl-2">__ </span>
              تنظیمات
              <span class=" select-none text-gray-600 pr-2"> __</span>
            </h3>
          </div>

          <div class="animationSettings flex items-ceneter justify-between ">
            <div class="themeSettings flex items-center  justify-start gap-4 text-xl my-6 ">
              <span v-if="state.toggle.guide_activation"
                class="text-green-700 bg-green-300 px-[.9rem] text-lg py-1 rounded-full select-none">
                <v-tooltip activator="parent" location="top">
                  تغییرات به صورت آنی اجرا شوند
                </v-tooltip>
                ?</span>
              <span class="text-black font-semibold text-base lg:text-lg">
                اعمال سریع تغییرات
                :</span>
            </div>
            <div class="animationSwitchButton flex justify-center items-center ">
              <v-switch color="success" ripple class=" flex switchBtn " />
            </div>
          </div>
        </div>

      </div>

      <div class="applySettings text-center mt-[4rem] mb-10">
        <v-btn append-icon="mdi mdi-check" class="bg-[#86afb5]" height="39" variant="flat"> اعمال تغییرات </v-btn>
      </div>

    </div>

  </v-navigation-drawer>

</template>
<style></style>