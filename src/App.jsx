// src/App.jsx

import './App.css'
import Navbar from './components/layout/Navbar'

import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import HomePage from './pages/Home/HomePage';
import MyPage from './pages/MyPage/MyPage';
import LoginPage from './pages/MyPage/LoginPage';
import SignupPage from './pages/MyPage/SignupPage';
import ChangeName from './pages/MyPage/ChangeName';
import EditReview from './pages/MyPage/EditReview';
import ScrollToTop from './components/layout/ScrollToTop';
import ToiletDetailPage from './pages/Detail/ToiletDetailPage';
import WriteReviewPage from './pages/Detail/WriteReviewPage';
import AllReviewsPage from './pages/Detail/AllReviewsPage';
import PhotoReviewsPage from './pages/Detail/PhotoReviewsPage';
import PhotoReviewDetailPage from './pages/Detail/PhotoReviewDetailPage';
import AuthCallback from './pages/AuthCallback'; 


function App() {
  return (
    <BrowserRouter >
    <ScrollToTop />
      <Routes>
        
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/changename" element={<ChangeName />} />
        <Route path="/editreview" element={<EditReview />} />

        <Route path="/toilet/:toiletId" element={<ToiletDetailPage />} />
        <Route path="/toilet/:toiletId/reviews" element={<AllReviewsPage />} />
        <Route path="/toilet/:toiletId/write" element={<WriteReviewPage />} />
        <Route path="/toilet/:toiletId/photos" element={<PhotoReviewsPage />} />
        <Route path="/toilet/:toiletId/photo/:photoId" element={<PhotoReviewDetailPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

      </Routes>
    
      <Navbar />
    
    </BrowserRouter>
  )
}

export default App