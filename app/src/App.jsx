import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import MovieDetails from "./pages/MovieDetails.jsx";
import WorkshopSlots from "./pages/WorkshopSlots.jsx";
import Confirmation from "./pages/Confirmation.jsx";
import SeatSelection from "./pages/SeatSelection.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
  <Route path="/" element={<Home />} />
  <Route path="/movie/:id" element={<MovieDetails />} />
  <Route path="/select-slot" element={<WorkshopSlots />} />
  <Route path="/select-seats" element={<SeatSelection />} />
  <Route path="/confirmation" element={<Confirmation />} />
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>

    </BrowserRouter>
  );
}
