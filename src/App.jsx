import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import FlowAIndex from './flows/flow-a/FlowAIndex'
import FlowARooms from './flows/flow-a/Rooms'
import FlowAServices from './flows/flow-a/Services'
import FlowAConfirmation from './flows/flow-a/Confirmation'

import FlowBIndex from './flows/flow-b/FlowBIndex'
import FlowBRooms from './flows/flow-b/Rooms'
import FlowBServices from './flows/flow-b/Services'
import FlowBConfirmation from './flows/flow-b/Confirmation'

import FlowCIndex from './flows/flow-c/FlowCIndex'
import FlowCRooms from './flows/flow-c/Rooms'
import FlowCServices from './flows/flow-c/Services'
import FlowCConfirmation from './flows/flow-c/Confirmation'

import FlowDIndex from './flows/flow-d/FlowDIndex'

import FlowEIndex from './flows/flow-e/FlowEIndex'
import FlowERooms from './flows/flow-e/Rooms'
import FlowEItinerary from './flows/flow-e/Itinerary'
import FlowEConfirmation from './flows/flow-e/Confirmation'

import Home from './Home'
import HotelSelection from './HotelSelection'
import Complete from './Complete'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HotelSelection />} />
        <Route path="/home" element={<Home />} />
        <Route path="/complete" element={<Complete />} />

        <Route path="/flow-a" element={<FlowAIndex />}>
          <Route index element={<Navigate to="rooms" replace />} />
          <Route path="rooms" element={<FlowARooms />} />
          <Route path="services" element={<FlowAServices />} />
          <Route path="confirmation" element={<FlowAConfirmation />} />
        </Route>

        <Route path="/flow-b" element={<FlowBIndex priced={false} />}>
          <Route index element={<Navigate to="rooms" replace />} />
          <Route path="rooms" element={<FlowBRooms priced={false} />} />
          <Route path="services" element={<FlowBServices />} />
          <Route path="confirmation" element={<FlowBConfirmation />} />
        </Route>

        <Route path="/flow-b-priced" element={<FlowBIndex priced={true} />}>
          <Route index element={<Navigate to="rooms" replace />} />
          <Route path="rooms" element={<FlowBRooms priced={true} />} />
          <Route path="services" element={<FlowBServices />} />
          <Route path="confirmation" element={<FlowBConfirmation />} />
        </Route>

        <Route path="/flow-c" element={<FlowCIndex />}>
          <Route index element={<Navigate to="rooms" replace />} />
          <Route path="rooms" element={<FlowCRooms />} />
          <Route path="services" element={<FlowCServices />} />
          <Route path="confirmation" element={<FlowCConfirmation />} />
        </Route>

        <Route path="/flow-d" element={<FlowDIndex />} />

        <Route path="/flow-e" element={<FlowEIndex />}>
          <Route index element={<Navigate to="rooms" replace />} />
          <Route path="rooms" element={<FlowERooms />} />
          <Route path="itinerary" element={<FlowEItinerary />} />
          <Route path="confirmation" element={<FlowEConfirmation />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
