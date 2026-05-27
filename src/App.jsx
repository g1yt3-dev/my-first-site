import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import RoomPage from "./pages/RoomPage";
import CabinetDetail from "./pages/CabinetDetail";
import ItemList from "./pages/ItemList";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/items" element={<ItemList />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
        <Route path="/room/:roomId/cabinet/:cabinetId" element={<CabinetDetail />} />
      </Routes>
    </Router>
  );
}
