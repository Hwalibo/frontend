import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import home from '../../assets/Navbar/home.svg';
import my from '../../assets/Navbar/my.svg';
import my_active from '../../assets/Navbar/my_active.svg';
import home_active from '../../assets/Navbar/home_active.svg';
import './Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("home");

  // 현재 경로가 바뀔 때마다 activeTab 갱신
  useEffect(() => {
    if (location.pathname === "/mypage" || location.pathname === "/ChangeName") {
      setActiveTab("my");
    } else {
      setActiveTab("home");
    }
  }, [location.pathname]);

  const handleClick = (tab, path) => {
    setActiveTab(tab);
    navigate(path);
  };

  return (
    <div className="navbar">
      <div className="nav-con">
        <div className="icons">
          <img
            src={activeTab === "home" ? home_active : home}
            alt="home"
            onClick={() => handleClick("home", "/homepage")}
          />
          <img
            src={activeTab === "my" ? my_active : my}
            alt="my"
            onClick={() => handleClick("my", "/mypage")}
          />
        </div>
      </div>
    </div>
  );
}
