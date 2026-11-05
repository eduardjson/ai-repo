import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface FilterState {
  search: string
  categoryId: string
  manufacturerId: string
}

const initialState: FilterState = {
  search: '',
  categoryId: '',
  manufacturerId: '',
}

const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload
    },
    setCategoryId(state, action: PayloadAction<string>) {
      state.categoryId = action.payload
    },
    setManufacturerId(state, action: PayloadAction<string>) {
      state.manufacturerId = action.payload
    },
    resetFilters(state) {
      state.search = ''
      state.categoryId = ''
      state.manufacturerId = ''
    },
  },
})

export const { setSearch, setCategoryId, setManufacturerId, resetFilters } = filterSlice.actions
export default filterSlice.reducer
