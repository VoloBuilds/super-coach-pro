import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/store'
import App from './App'
import './index.css'
import { setTemplates, setWorkouts } from './store/workoutSlice'
import { workoutTemplates, workouts } from './data/mockWorkouts'

// Load mock data
store.dispatch(setTemplates(workoutTemplates))
store.dispatch(setWorkouts(workouts))

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)
