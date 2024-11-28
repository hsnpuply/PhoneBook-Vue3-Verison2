// Utilities
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    contacts:[

    ]
    //
  }),
  getters:{
    getContacts: (state) => state.contacts,
  },

  actions:{

  }
})
