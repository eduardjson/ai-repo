import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface FilterState {
  search: string
  manufacturer: string
  category: string
  priceMin: number | null
  priceMax: number | null
}

const initialState: FilterState = {
  search: '',
  manufacturer: '',
  category: '',
  priceMin: null,
  priceMax: null,
}

const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload
    },
    setManufacturer(state, action: PayloadAction<string>) {
      state.manufacturer = action.payload
    },
    setCategory(state, action: PayloadAction<string>) {
      state.category = action.payload
    },
    setPriceRange(state, action: PayloadAction<{ min: number | null; max: number | null }>) {
      state.priceMin = action.payload.min
      state.priceMax = action.payload.max
    },
    resetFilters(state) {
      state.search = ''
      state.manufacturer = ''
      state.category = ''
      state.priceMin = null
      state.priceMax = null
    },
  },
})

export const { setSearch, setManufacturer, setCategory, setPriceRange, resetFilters } = filterSlice.actions
export default filterSlice.reducer
